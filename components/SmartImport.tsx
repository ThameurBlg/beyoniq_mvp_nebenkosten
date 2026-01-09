import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Plus, FileText, Building2 } from 'lucide-react';
import { AllocationKey, Expense } from '../types';
import { useAppStore } from '../store';

export const SmartImport: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<Partial<Expense>[]>([]);
  const { addExpense, selectedPropertyId, properties } = useAppStore();

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      setFile(uploadedFile);
      setIsProcessing(true);
      
      // SIMULATION OF PARSING (PDF OCR or Excel)
      setTimeout(() => {
        const isPdf = uploadedFile.name.toLowerCase().endsWith('.pdf');
        
        let mockParsed: Partial<Expense>[] = [];

        if (isPdf) {
            // Simulate PDF OCR Extraction
            // In a real app, this would run local Tesseract.js or similar
            mockParsed = [{
                name: `Rechnung: ${uploadedFile.name.replace('.pdf', '')}`,
                amount: Math.floor(Math.random() * 50000) + 5000, // Random between 50€ and 550€
                date_billed: new Date().toISOString().split('T')[0],
                period_start: '2023-01-01',
                period_end: '2023-12-31',
                allocation_key: AllocationKey.DIRECT // Default for invoices often needs check
            }];
        } else {
            // Mock Excel Parsing
            mockParsed = [
                { name: 'Strom Allgemein', amount: 45000, date_billed: '2023-12-01', period_start: '2023-01-01', period_end: '2023-12-31' },
                { name: 'Winterdienst', amount: 12000, date_billed: '2023-03-01', period_start: '2023-01-01', period_end: '2023-03-31' },
                { name: 'Aufzug Wartung', amount: 89000, date_billed: '2023-11-15', period_start: '2023-01-01', period_end: '2023-12-31' },
            ];
        }

        setPreviewData(mockParsed);
        setIsProcessing(false);
      }, 1500); // Slightly longer delay for "OCR" feel
    }
  };

  const handleImport = () => {
    if (!selectedPropertyId) return;

    previewData.forEach(p => {
        addExpense({
            id: Math.random().toString(36).substr(2, 9),
            property_id: selectedPropertyId,
            name: p.name || 'Unbekannt',
            amount: p.amount || 0,
            date_billed: p.date_billed || new Date().toISOString(),
            period_start: p.period_start || '2023-01-01',
            period_end: p.period_end || '2023-12-31',
            allocation_key: p.allocation_key || AllocationKey.AREA
        });
    });
    onClose();
  };

  return (
    <div className="p-6 h-full flex flex-col">
        <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Dokumente importieren</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Zuweisung zum Objekt:</span>
                <span className="flex items-center gap-1 font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    <Building2 size={12} />
                    {selectedProperty?.name}
                </span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-8 flex-1">
            {/* Left: Upload Area */}
            <div className="border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 flex flex-col items-center justify-center p-8 transition-colors hover:border-slate-400 relative group">
                <input 
                    type="file" 
                    accept=".xlsx,.csv,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-700 mb-4 transition-transform group-hover:scale-110">
                    {isProcessing ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
                    ) : (
                        <UploadCloud size={32} />
                    )}
                </div>
                <div className="text-center max-w-xs">
                    <p className="font-medium text-slate-900">
                        {file ? file.name : 'PDF-Rechnung oder Excel-Datei ablegen'}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                        Unterstützt: .pdf (Auto-OCR), .xlsx, .csv
                    </p>
                </div>
            </div>

            {/* Right: Preview */}
            <div className="bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-medium text-sm text-slate-700 flex justify-between items-center">
                    <span>Vorschau ({previewData.length} Positionen)</span>
                    {previewData.length > 0 && (
                        file?.name.endsWith('.pdf') ? <FileText size={16} className="text-slate-400"/> : <FileSpreadsheet size={16} className="text-slate-400"/>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto p-0">
                    {previewData.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm italic p-8 text-center">
                            <FileText size={32} className="mb-2 opacity-20" />
                            <p>Laden Sie eine Datei hoch,<br/>um die Daten hier zu prüfen.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 text-left text-xs uppercase sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 font-medium">Bezeichnung</th>
                                    <th className="px-4 py-2 font-medium">Verteilschlüssel</th>
                                    <th className="px-4 py-2 font-medium text-right">Betrag</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {previewData.map((row, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-2 text-slate-700">
                                            <div className="font-medium">{row.name}</div>
                                            <div className="text-xs text-slate-400">{row.date_billed}</div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                {row.allocation_key}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-right font-mono text-slate-900 font-medium">
                                            {(row.amount! / 100).toFixed(2)} €
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <button 
                        onClick={handleImport}
                        disabled={previewData.length === 0}
                        className="w-full bg-slate-900 text-white py-2.5 rounded-md font-medium text-sm disabled:opacity-50 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Plus size={16} />
                        {previewData.length} Ausgaben buchen
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
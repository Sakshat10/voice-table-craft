import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import SpeechInput from '@/components/SpeechInput';
import TableDisplay from '@/components/TableDisplay';
import type { TableColumn, TableRow } from '@/utils/commandParser';

const Index = () => {
  const { t, i18n } = useTranslation();
  const [columns, setColumns] = useState<TableColumn[]>([]);
  const [rows, setRows] = useState<TableRow[]>([]);

  const handleTableCreate = (newColumns: TableColumn[]) => {
    console.log('🔥 handleTableCreate called with:', newColumns);
    setColumns(newColumns);
    setRows([]);
    console.log('✅ Columns state updated');
  };

  const handleRowAdd = (rowData: string[]) => {
    if (columns.length === 0) {
      return;
    }

    const newRow: TableRow = {
      id: Date.now().toString(),
      data: rowData.slice(0, columns.length),
    };

    // Pad with empty strings if row data is shorter than columns
    while (newRow.data.length < columns.length) {
      newRow.data.push('');
    }

    setRows([...rows, newRow]);
  };

  const handleClear = () => {
    setColumns([]);
    setRows([]);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              onClick={toggleLanguage}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Languages className="h-4 w-4" />
              {i18n.language === 'en' ? 'العربية' : 'English'}
            </Button>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold gradient-primary bg-clip-text text-transparent">
            {t('appTitle')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('appDescription')}
          </p>
        </header>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Speech Input Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Voice Control</h2>
            <SpeechInput
              onTableCreate={handleTableCreate}
              onRowAdd={handleRowAdd}
            />
          </div>

          {/* Table Display Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Generated Table</h2>
            <TableDisplay
              columns={columns}
              rows={rows}
              onClear={handleClear}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Powered by Web Speech API • Built with React & Tailwind CSS
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;

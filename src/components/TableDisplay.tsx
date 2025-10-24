import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow as TableRowComponent } from '@/components/ui/table';
import { Download, Trash2 } from 'lucide-react';
import { exportToCSV, downloadCSV, type TableColumn, type TableRow } from '@/utils/commandParser';
import { toast } from '@/hooks/use-toast';

interface TableDisplayProps {
  columns: TableColumn[];
  rows: TableRow[];
  onClear: () => void;
}

const TableDisplay = ({ columns, rows, onClear }: TableDisplayProps) => {
  const { t } = useTranslation();

  const handleExport = () => {
    if (columns.length === 0 || rows.length === 0) {
      toast({
        title: t('error'),
        description: 'Cannot export empty table',
        variant: 'destructive',
      });
      return;
    }

    const csvContent = exportToCSV(columns, rows);
    downloadCSV(csvContent, `voice-table-${Date.now()}.csv`);
    
    toast({
      title: t('success'),
      description: t('tableExported'),
    });
  };

  if (columns.length === 0) {
    return (
      <Card className="p-8 text-center shadow-card">
        <p className="text-muted-foreground">{t('tableEmpty')}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          onClick={handleExport}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {t('exportCSV')}
        </Button>
        <Button
          onClick={onClear}
          variant="outline"
          size="sm"
          className="gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          {t('clearTable')}
        </Button>
      </div>

      <Card className="overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRowComponent className="bg-primary/5">
                {columns.map((column, index) => (
                  <TableHead key={index} className="font-semibold text-primary">
                    {column.name}
                  </TableHead>
                ))}
              </TableRowComponent>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRowComponent>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center text-muted-foreground py-8"
                  >
                    No data yet. Add rows using voice commands.
                  </TableCell>
                </TableRowComponent>
              ) : (
                rows.map((row) => (
                  <TableRowComponent key={row.id}>
                    {row.data.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRowComponent>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default TableDisplay;

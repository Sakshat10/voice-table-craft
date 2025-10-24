export interface TableColumn {
  name: string;
}

export interface TableRow {
  id: string;
  data: string[];
}

export interface ParsedCommand {
  type: 'create' | 'add' | 'unknown';
  columns?: TableColumn[];
  rowData?: string[];
}

export const parseVoiceCommand = (transcript: string): ParsedCommand => {
  const lowerTranscript = transcript.toLowerCase().trim();
  
  console.log('🎤 Parsing command:', transcript);
  console.log('🎤 Lowercase:', lowerTranscript);

  // Check for create table command - more flexible patterns
  const createPatterns = [
    /create\s+(?:a\s+)?table\s+with\s+(\d+)\s+columns?\s+named\s+(.+)/i,
    /make\s+(?:a\s+)?table\s+with\s+(\d+)\s+columns?\s+named\s+(.+)/i,
    /new\s+table\s+with\s+(\d+)\s+columns?\s+named\s+(.+)/i,
    /create\s+(?:a\s+)?table\s+with\s+columns?\s+(.+)/i, // Without number
    /table\s+with\s+(\d+)\s+columns?\s+named\s+(.+)/i, // Shorter version
  ];

  for (const pattern of createPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      console.log('✅ Matched create pattern:', pattern);
      console.log('📊 Match groups:', match);
      
      let columnCount: number;
      let columnNamesStr: string;
      
      // Handle patterns with or without explicit column count
      if (match.length === 3) {
        columnCount = parseInt(match[1]);
        columnNamesStr = match[2];
      } else if (match.length === 2) {
        columnNamesStr = match[1];
        // Count columns from the names
        const tempNames = columnNamesStr.split(/[,،\s]+and\s+|[,،]\s*/);
        columnCount = tempNames.length;
      } else {
        continue;
      }
      
      const columnNames = columnNamesStr
        .split(/[,،\s]+and\s+|[,،]\s*/)
        .map(name => name.trim())
        .filter(name => name.length > 0);

      console.log('📝 Parsed columns:', columnNames);

      if (columnNames.length > 0) {
        const result = {
          type: 'create' as const,
          columns: columnNames.slice(0, columnCount).map(name => ({ name }))
        };
        console.log('🎯 Returning create command:', result);
        return result;
      }
    }
  }

  // Check for add row command
  const addPatterns = [
    /add\s+(?:a\s+)?row[:\s]+(.+)/i,
    /insert\s+(?:a\s+)?row[:\s]+(.+)/i,
    /new\s+row[:\s]+(.+)/i,
    /add\s+(.+)/i, // More flexible
  ];

  for (const pattern of addPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      console.log('✅ Matched add pattern:', pattern);
      const rowDataStr = match[1];
      const rowData = rowDataStr
        .split(/[,،]\s*/)
        .map(value => value.trim())
        .filter(value => value.length > 0);

      console.log('📝 Parsed row data:', rowData);

      if (rowData.length > 0) {
        const result = {
          type: 'add' as const,
          rowData
        };
        console.log('🎯 Returning add command:', result);
        return result;
      }
    }
  }

  console.log('❌ No pattern matched - returning unknown');
  return { type: 'unknown' };
};

export const exportToCSV = (columns: TableColumn[], rows: TableRow[]): string => {
  const headers = columns.map(col => col.name).join(',');
  const rowsData = rows.map(row => row.data.join(',')).join('\n');
  return `${headers}\n${rowsData}`;
};

export const downloadCSV = (csvContent: string, filename: string = 'table.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

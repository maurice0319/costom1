import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPREADSHEET_ID = '16s_7X_2CF3sA8BBg6fjQVgFroUw04nz70IJtc6CcNjE';

// Parse CSV string to array of objects
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];
  
  // Parse header row
  const headers = parseCSVLine(lines[0]);
  
  // Parse data rows
  const data: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = { _rowIndex: String(i + 1) }; // Store original row number (1-indexed, +1 for header)
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return data;
}

// Parse a single CSV line, handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userEmail } = await req.json();

    if (action === 'read') {
      // Fetch public spreadsheet as CSV
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0`;
      
      console.log('Fetching spreadsheet from:', csvUrl);
      
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch spreadsheet: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      console.log('CSV fetched, length:', csvText.length);
      
      const allData = parseCSV(csvText);
      console.log('Parsed rows:', allData.length);
      
      // Filter data by user email (case-insensitive)
      const userEmailLower = userEmail?.toLowerCase() || '';
      const filteredData = allData.filter(row => {
        const rowEmail = (row['電郵'] || row['email'] || row['Email'] || '').toLowerCase();
        return rowEmail === userEmailLower;
      });
      
      console.log('Filtered rows for user:', filteredData.length);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: filteredData,
          total: allData.length 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

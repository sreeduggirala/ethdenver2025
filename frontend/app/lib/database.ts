import { createClient } from '@supabase/supabase-js';

// Function to calculate and return points
async function calculatePoints() {
  // Initialize Supabase client (replace with your actual URL and key)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const tableName = 'points';

  // SQL query to get the two most recent entries per kolAddress
  const query = `
    SELECT kolAddress, netWorth, created_at, rn
    FROM (
      SELECT kolAddress, netWorth, created_at,
             ROW_NUMBER() OVER (PARTITION BY kolAddress ORDER BY created_at DESC) as rn
      FROM ${tableName}
    ) sub
    WHERE rn <= 2
    ORDER BY kolAddress, rn
  `;

  // Execute the query
  const { data, error } = await supabase.from(`(${query}) as sub`).select('*');

  if (error) {
    console.error('Error fetching data:', error);
    return [];
  }

  // Define the row interface based on table structure
  interface Row {
    kolAddress: string;
    netWorth: number;
    created_at: string; // timestamptz comes as ISO string
    rn: number; // Row number (1 or 2)
  }

  const rows: Row[] = data as Row[];

  // Process data and calculate points
  const results: { kolAddress: string; points: number | null; message?: string }[] = [];
  let currentKolAddress: string | null = null;
  let currentEntries: Row[] = [];

  for (const row of rows) {
    if (row.kolAddress !== currentKolAddress) {
      // Process previous group
      if (currentKolAddress) {
        if (currentEntries.length === 2) {
          const current = currentEntries[0]; // Most recent (rn = 1)
          const previous = currentEntries[1]; // Second most recent (rn = 2)
          if (previous.netWorth === 0) {
            results.push({
              kolAddress: currentKolAddress,
              points: null,
              message: 'Cannot calculate points: previous netWorth is zero'
            });
          } else {
            const PnL = current.netWorth - previous.netWorth;
            const normalizedPnL = PnL / previous.netWorth;
            const points = normalizedPnL * 100;
            results.push({ kolAddress: currentKolAddress, points });
          }
        } else {
          // Fewer than 2 entries (e.g., only 1 as in your screenshot)
          results.push({
            kolAddress: currentKolAddress,
            points: null,
            message: 'Insufficient data: only one entry available'
          });
        }
      }
      // Start new group
      currentKolAddress = row.kolAddress;
      currentEntries = [row];
    } else {
      currentEntries.push(row);
    }
  }

  // Handle the last group
  if (currentKolAddress && currentEntries.length > 0) {
    if (currentEntries.length === 2) {
      const current = currentEntries[0];
      const previous = currentEntries[1];
      if (previous.netWorth === 0) {
        results.push({
          kolAddress: currentKolAddress,
          points: null,
          message: 'Cannot calculate points: previous netWorth is zero'
        });
      } else {
        const PnL = current.netWorth - previous.netWorth;
        const normalizedPnL = PnL / previous.netWorth;
        const points = normalizedPnL * 100;
        results.push({ kolAddress: currentKolAddress, points });
      }
    } else {
      results.push({
        kolAddress: currentKolAddress,
        points: null,
        message: 'Insufficient data: only one entry available'
      });
    }
  }

  // Log and return results
  console.log(results);
  return results;
}

// Execute the function
calculatePoints();
export function createExportService() {
	return {
		arrayToCsv<T extends Record<string, any>>(data: T[]): string {
			if (!data || data.length === 0) return '';
			const headers = Object.keys(data[0]);
			const csvRows: string[] = [];

			csvRows.push(headers.join(','));

			for (const row of data) {
				const values = headers.map((header) => {
					const val = row[header];
					if (val === null || val === undefined) return '""';
					const escaped = String(val).replace(/"/g, '""');
					return `"${escaped}"`;
				});
				csvRows.push(values.join(','));
			}

			return csvRows.join('\n');
		}
	};
}

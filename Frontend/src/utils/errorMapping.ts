export function mapBackendErrors(error: any, setError: (field: any, error: { type: string; message: string }) => void) {
  if (error && error.details && Array.isArray(error.details)) {
    error.details.forEach((detail: any) => {
      if (Array.isArray(detail.path) && detail.path.length > 0) {
        // Zod backend path validation will return e.g. ["body", "email"]
        // We strip "body" to match the React Hook Form field name (e.g. "email")
        const pathArray = detail.path[0] === 'body' && detail.path.length > 1
          ? detail.path.slice(1)
          : detail.path;
        
        // Convert array path back to dot notation (e.g. "pets.0.name")
        const fieldName = pathArray.join('.');
        
        setError(fieldName, {
          type: 'backend',
          message: detail.message || 'Invalid value.'
        });
      }
    });
  } else if (error && error.message) {
    console.warn('Unhandled backend error:', error.message);
  }
}

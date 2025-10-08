function Debug() {
  const envVars = {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    BASE_URL: import.meta.env.BASE_URL,
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Debug Info</h1>
      <pre style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        {JSON.stringify(envVars, null, 2)}
      </pre>
    </div>
  );
}

export default Debug;

import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }
  return <div>Última atualização: {updatedAtText}</div>;
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let dbInfo = "Carregando...";
  let versionDatabase = "";
  let maxConnectionsDatabase = "";
  let openedConnectionsDatabase = "";

  if (!isLoading && data) {
    dbInfo = "";
    versionDatabase = data.dependencies.database.version;
    maxConnectionsDatabase = data.dependencies.database.max_connections;
    openedConnectionsDatabase = data.dependencies.database.opened_connections;
  }
  return (
    <>
      <h1>Database:</h1> {dbInfo}
      <div>Versão: {versionDatabase}</div>
      <div>Max Connections : {maxConnectionsDatabase}</div>
      <div>Opened Connections: {openedConnectionsDatabase}</div>
    </>
  );
}

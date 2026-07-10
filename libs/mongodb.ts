import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB_NAME as string;

// Validação Estrita das Variáveis de Ambiente
if (!uri) {
    throw new Error("MONGODB_URI is not defined in the environment variables");
}

if (!dbName) {
    throw new Error("MONGODB_DB_NAME is not defined in the environment variables");
}

// CORREÇÃO: Permite explicitamente o tipo MongoClient/Db ou null
let clientInstance: MongoClient | null = null;
let dbInstance: Db | null = null;

/**
 * Retorna a instância do cliente MongoDB reutilizando a conexão existente.
 */
export async function getClient(): Promise<MongoClient> {
    if (!clientInstance) {
        clientInstance = new MongoClient(uri, {
            connectTimeoutMS: 5000,
            socketTimeoutMS: 30000,
            serverSelectionTimeoutMS: 5000,
            appName: "devrel-github-typescript-passwordhistory"
        });
        await clientInstance.connect();
    }
    return clientInstance;
}

/**
 * Retorna a instância do banco de dados reutilizando a conexão existente.
 */
export async function getDb(): Promise<Db> {
    if (!dbInstance) {
        // Reutiliza o cliente ou cria um novo se não existir
        const client = await getClient();
        
        // Conecta especificamente no banco de dados validado
        dbInstance = client.db(dbName);
        console.log(`🍃 Conexão Singleton estabelecida com sucesso no banco: "${dbName}"`);
    }
    return dbInstance;
}

/**
 * Fecha o pool de conexões de forma limpa durante o encerramento do servidor (SIGINT/SIGTERM)
 */
export async function closeConnection(): Promise<void> {
    if (clientInstance) {
        await clientInstance.close();
        clientInstance = null;
        dbInstance = null;
        console.log("🛑 Pool de conexões do MongoDB encerrado graciosamente.");
    }
}

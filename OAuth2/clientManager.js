// services/clientManager.js
const fs = require('fs').promises;
const path = require('path');

class ClientManager {
    constructor() {
        this.clients = null;
        this.clientsPath = path.join(__dirname, './config/clients.json');
    }

    async loadClients() {
        try {
            const data = await fs.readFile(this.clientsPath, 'utf8');
            this.clients = JSON.parse(data);
            
            // Replace secrets with environment variables if they exist
            for (const [clientId, client] of Object.entries(this.clients)) {
                const envSecret = process.env[`CLIENT_SECRET_${clientId}`];
                if (envSecret) {
                    client.secret = envSecret;
                }
            }
        } catch (error) {
            console.error('Error loading clients:', error);
            throw new Error('Failed to load client configuration');
        }
    }

    async validateClient(clientId, clientSecret) {
        if (!this.clients) {
            await this.loadClients();
        }

        const client = this.clients[clientId];
        if (!client || !client.active) {
            return null;
        }

        if (client.secret === clientSecret) {
            return {
                clientId,
                scope: client.scope,
                name: client.name
            };
        }

        return null;
    }

    async getClientInfo(clientId) {
        if (!this.clients) {
            await this.loadClients();
        }

        const client = this.clients[clientId];
        if (!client || !client.active) {
            return null;
        }

        return {
            clientId,
            scope: client.scope,
            name: client.name
        };
    }

    async addClient(clientId, clientData) {
        if (!this.clients) {
            await this.loadClients();
        }

        this.clients[clientId] = {
            ...clientData,
            active: true
        };

        await this._saveClients();
    }

    async deactivateClient(clientId) {
        if (!this.clients) {
            await this.loadClients();
        }

        if (this.clients[clientId]) {
            this.clients[clientId].active = false;
            await this._saveClients();
        }
    }

    // Using underscore prefix as a convention for "internal" method
    async _saveClients() {
        // Create a copy without the secrets for saving
        const clientsToSave = {};
        for (const [clientId, client] of Object.entries(this.clients)) {
            clientsToSave[clientId] = {
                ...client,
                secret: process.env[`CLIENT_SECRET_${clientId}`] ? `ENV:CLIENT_SECRET_${clientId}` : client.secret
            };
        }

        await fs.writeFile(
            this.clientsPath,
            JSON.stringify(clientsToSave, null, 2),
            'utf8'
        );
    }
}

module.exports = new ClientManager();
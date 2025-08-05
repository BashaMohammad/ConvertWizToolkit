/**
 * Tool Routes Handler for ConvertWiz
 * Serves isolated tool content and manages tool-specific APIs
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Tool content API endpoint
router.get('/api/tool-content/:section', async (req, res) => {
    try {
        const section = req.params.section;
        
        // Read main index.html to extract tool section
        const indexPath = path.join(__dirname, '../public/index.html');
        const indexContent = await fs.readFile(indexPath, 'utf8');
        
        // Extract the specific section content
        const sectionRegex = new RegExp(`<section[^>]*id="${section}"[^>]*>(.*?)</section>`, 'gs');
        const match = sectionRegex.exec(indexContent);
        
        if (match) {
            const sectionContent = match[1];
            res.send(sectionContent);
        } else {
            res.status(404).send('<div class="error">Tool content not found</div>');
        }
    } catch (error) {
        console.error('Error serving tool content:', error);
        res.status(500).send('<div class="error">Failed to load tool content</div>');
    }
});

// Serve tool static files
router.use('/tools/:toolId', express.static(path.join(__dirname, '../tools'), {
    setHeaders: (res, path) => {
        // Set appropriate MIME types
        if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        } else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Tool discovery API
router.get('/api/tools', async (req, res) => {
    try {
        const registryPath = path.join(__dirname, '../tools/registry.json');
        const registryContent = await fs.readFile(registryPath, 'utf8');
        const registry = JSON.parse(registryContent);
        
        res.json(registry);
    } catch (error) {
        console.error('Error reading tool registry:', error);
        res.status(500).json({ error: 'Failed to load tool registry' });
    }
});

// Individual tool info API
router.get('/api/tools/:toolId/config', async (req, res) => {
    try {
        const toolId = req.params.toolId;
        const configPath = path.join(__dirname, `../tools/${toolId}/config.json`);
        const configContent = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configContent);
        
        res.json(config);
    } catch (error) {
        console.error(`Error reading config for tool ${req.params.toolId}:`, error);
        res.status(404).json({ error: 'Tool configuration not found' });
    }
});

module.exports = router;
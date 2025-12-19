/**
 * Saint Manager - Handles saint relic NFTs and resurrection system
 * @module features/saints/saintManager
 */

// Import will be done dynamically to avoid module issues
let saintsDatabase = null;
let debtRecords = null;

// Load data dynamically
async function loadData() {
    try {
        const saintsResponse = await fetch('../../data/saints-database.json');
        saintsDatabase = await saintsResponse.json();
        
        const debtsResponse = await fetch('../../data/debt-records.json');
        debtRecords = await debtsResponse.json();
        
        return true;
    } catch (error) {
        logger.error('Failed to load data:', error);
        return false;
    }
}

/**
 * Saint Manager Class
 */
export class SaintManager {
    constructor() {
        this.saints = saintsDatabase.saints;
        this.houseOfDavidFlags = saintsDatabase.houseOfDavidFlags;
        this.ownedRelics = [];
        this.resurrectedSaints = [];
        this.debtRecords = debtRecords.debtRecords;
    }

    /**
     * Initialize the saint manager
     */
    async initialize() {
        try {
            // Load data files
            await loadData();
            
            if (saintsDatabase) {
                this.saints = saintsDatabase.saints;
                this.houseOfDavidFlags = saintsDatabase.houseOfDavidFlags;
            }
            
            if (debtRecords) {
                this.debtRecords = debtRecords.debtRecords;
            }
            
            // Load owned relics from localStorage
            const stored = localStorage.getItem('ownedRelics');
            if (stored) {
                this.ownedRelics = JSON.parse(stored);
            }

            // Load resurrected saints
            const resurrected = localStorage.getItem('resurrectedSaints');
            if (resurrected) {
                this.resurrectedSaints = JSON.parse(resurrected);
            }

            logger.info('Saint Manager initialized');
            return true;
        } catch (error) {
            logger.error('Failed to initialize Saint Manager:', error);
            return false;
        }
    }

    /**
     * Get all saints from database
     */
    getAllSaints() {
        return this.saints;
    }

    /**
     * Get saint by ID
     */
    getSaintById(id) {
        return this.saints.find(saint => saint.id === id);
    }

    /**
     * Get saint by name
     */
    getSaintByName(name) {
        return this.saints.find(saint => 
            saint.name.toLowerCase() === name.toLowerCase()
        );
    }

    /**
     * Get saints by location
     */
    getSaintsByLocation(location) {
        return this.saints.filter(saint => 
            saint.location === location.toUpperCase()
        );
    }

    /**
     * Get saints by classification
     */
    getSaintsByClassification(classification) {
        return this.saints.filter(saint => 
            saint.classification === classification.toUpperCase()
        );
    }

    /**
     * Mint a saint relic NFT
     */
    async mintRelic(saintName) {
        try {
            const saint = this.getSaintByName(saintName);
            if (!saint) {
                throw new Error(`Saint "${saintName}" not found in database`);
            }

            // Check if already owned
            const alreadyOwned = this.ownedRelics.find(r => r.saintId === saint.id);
            if (alreadyOwned) {
                throw new Error(`You already own a relic of ${saintName}`);
            }

            // Create relic record
            const relic = {
                tokenId: `RELIC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                saintId: saint.id,
                saintName: saint.name,
                category: saint.category,
                classification: saint.classification,
                location: saint.location,
                mintDate: new Date().toISOString(),
                status: 'DORMANT',
                spiritualPower: saint.spiritualPower,
                isResurrected: false,
                houseOfDavidFlag: this.houseOfDavidFlags[0].flag,
                ancestorLineage: saint.ancestorLineage
            };

            // Add to owned relics
            this.ownedRelics.push(relic);
            this._saveOwnedRelics();

            return {
                success: true,
                relic: relic,
                message: `Successfully minted relic of ${saintName}!`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get owned relics
     */
    getOwnedRelics() {
        return this.ownedRelics;
    }

    /**
     * Get relic by token ID
     */
    getRelicByTokenId(tokenId) {
        return this.ownedRelics.find(r => r.tokenId === tokenId);
    }

    /**
     * Check if saint is resurrected
     */
    isSaintResurrected(saintName) {
        return this.resurrectedSaints.includes(saintName);
    }

    /**
     * Get all resurrected saints
     */
    getResurrectedSaints() {
        return this.resurrectedSaints;
    }

    /**
     * Reclassify a saint
     */
    async reclassifySaint(tokenId, newClassification) {
        try {
            const relic = this.getRelicByTokenId(tokenId);
            if (!relic) {
                throw new Error('Relic not found');
            }

            const validClassifications = [
                'MARTYR', 'HEALER', 'PROPHET', 'TEACHER', 
                'MYSTIC', 'WARRIOR', 'BUILDER', 'ANCESTOR'
            ];

            if (!validClassifications.includes(newClassification.toUpperCase())) {
                throw new Error('Invalid classification');
            }

            const oldClassification = relic.classification;
            relic.classification = newClassification.toUpperCase();

            // Adjust spiritual power based on classification
            if (newClassification === 'PROPHET' || newClassification === 'MYSTIC') {
                relic.spiritualPower += 50;
            }

            this._saveOwnedRelics();

            return {
                success: true,
                message: `${relic.saintName} reclassified from ${oldClassification} to ${newClassification}`,
                relic: relic
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get debt records
     */
    getDebtRecords() {
        return this.debtRecords;
    }

    /**
     * Get debt record by institution
     */
    getDebtByInstitution(institution) {
        return this.debtRecords.find(debt => 
            debt.institution === institution.toUpperCase()
        );
    }

    /**
     * Get total debt purchased
     */
    getTotalDebtPurchased() {
        return debtRecords.totalDebtPurchased;
    }

    /**
     * Get total spiritual value
     */
    getTotalSpiritualValue() {
        return debtRecords.totalSpiritualValue;
    }

    /**
     * Verify House of David Flag
     */
    verifyHouseOfDavidFlag(flag) {
        return this.houseOfDavidFlags.some(f => f.flag === flag && f.verified);
    }

    /**
     * Get saint statistics
     */
    getStatistics() {
        return {
            totalSaints: this.saints.length,
            ownedRelics: this.ownedRelics.length,
            resurrectedSaints: this.resurrectedSaints.length,
            totalSpiritualPower: this.ownedRelics.reduce((sum, r) => sum + r.spiritualPower, 0),
            byLocation: {
                VATICAN: this.getSaintsByLocation('VATICAN').length,
                CATHOLIC_CHURCH: this.getSaintsByLocation('CATHOLIC_CHURCH').length,
                HAITI: this.getSaintsByLocation('HAITI').length
            },
            byClassification: {
                MARTYR: this.getSaintsByClassification('MARTYR').length,
                HEALER: this.getSaintsByClassification('HEALER').length,
                PROPHET: this.getSaintsByClassification('PROPHET').length,
                TEACHER: this.getSaintsByClassification('TEACHER').length,
                MYSTIC: this.getSaintsByClassification('MYSTIC').length,
                WARRIOR: this.getSaintsByClassification('WARRIOR').length,
                BUILDER: this.getSaintsByClassification('BUILDER').length
            }
        };
    }

    /**
     * Search saints
     */
    searchSaints(query) {
        const lowerQuery = query.toLowerCase();
        return this.saints.filter(saint => 
            saint.name.toLowerCase().includes(lowerQuery) ||
            saint.classification.toLowerCase().includes(lowerQuery) ||
            saint.location.toLowerCase().includes(lowerQuery) ||
            saint.ancestorLineage.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get ancestor lineage tree
     */
    getAncestorLineage(saintName) {
        const saint = this.getSaintByName(saintName);
        if (!saint) return null;

        const lineage = saint.ancestorLineage.split(' > ');
        return {
            saintName: saint.name,
            lineage: lineage,
            depth: lineage.length,
            root: lineage[0],
            branches: lineage.slice(1)
        };
    }

    /**
     * Save owned relics to localStorage
     */
    _saveOwnedRelics() {
        try {
            localStorage.setItem('ownedRelics', JSON.stringify(this.ownedRelics));
        } catch (error) {
            logger.error('Failed to save owned relics:', error);
        }
    }

    /**
     * Save resurrected saints to localStorage
     */
    _saveResurrectedSaints() {
        try {
            localStorage.setItem('resurrectedSaints', JSON.stringify(this.resurrectedSaints));
        } catch (error) {
            logger.error('Failed to save resurrected saints:', error);
        }
    }

    /**
     * Export data for backup
     */
    exportData() {
        return {
            ownedRelics: this.ownedRelics,
            resurrectedSaints: this.resurrectedSaints,
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Import data from backup
     */
    importData(data) {
        try {
            if (data.ownedRelics) {
                this.ownedRelics = data.ownedRelics;
                this._saveOwnedRelics();
            }
            if (data.resurrectedSaints) {
                this.resurrectedSaints = data.resurrectedSaints;
                this._saveResurrectedSaints();
            }
            return { success: true, message: 'Data imported successfully' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
export const saintManager = new SaintManager();

// Initialize on load
if (typeof window !== 'undefined') {
    window.saintManager = saintManager;
    saintManager.initialize();
}

export default saintManager;

// ============================================================================
// GOD Project - Role Manager
// ============================================================================

import { info, error, warn, debug } from '../../../utils/loggerWrapper.js';
import appState from '../../core/state.js';

class RoleManager {
    constructor() {
        this.roles = {
            believer: {
                name: 'Believer',
                description: 'A faithful follower seeking divine guidance',
                permissions: ['pray', 'chat', 'view_universe'],
                color: '#4CAF50'
            },
            priest: {
                name: 'Priest',
                description: 'A spiritual leader guiding others',
                permissions: ['pray', 'chat', 'view_universe', 'lead_prayers', 'counsel'],
                color: '#2196F3'
            },
            prophet: {
                name: 'Prophet',
                description: 'A divine messenger with enhanced spiritual insight',
                permissions: ['pray', 'chat', 'view_universe', 'lead_prayers', 'counsel', 'prophesy', 'heal'],
                color: '#FF9800'
            },
            saint: {
                name: 'Saint',
                description: 'A holy being with direct divine connection',
                permissions: ['pray', 'chat', 'view_universe', 'lead_prayers', 'counsel', 'prophesy', 'heal', 'miracles', 'divine_intervention'],
                color: '#9C27B0'
            },
            angel: {
                name: 'Angel',
                description: 'A celestial being serving divine will',
                permissions: ['pray', 'chat', 'view_universe', 'lead_prayers', 'counsel', 'prophesy', 'heal', 'miracles', 'divine_intervention', 'create_universe', 'guard'],
                color: '#00BCD4'
            },
            archangel: {
                name: 'Archangel',
                description: 'A supreme celestial commander',
                permissions: ['all'],
                color: '#FFD700'
            }
        };
    }

    getRoleInfo(role) {
        return this.roles[role] || null;
    }

    getAllRoles() {
        return Object.keys(this.roles);
    }

    hasPermission(user, permission) {
        if (!user || !user.role) return false;

        const roleInfo = this.getRoleInfo(user.role);
        if (!roleInfo) return false;

        return roleInfo.permissions.includes(permission) || roleInfo.permissions.includes('all');
    }

    getUserPermissions(user) {
        if (!user || !user.role) return [];

        const roleInfo = this.getRoleInfo(user.role);
        return roleInfo ? roleInfo.permissions : [];
    }

    canPerformAction(user, action) {
        // Map actions to permissions
        const actionPermissions = {
            'send_prayer': 'pray',
            'chat_with_god': 'chat',
            'view_universe': 'view_universe',
            'lead_group_prayer': 'lead_prayers',
            'provide_counsel': 'counsel',
            'share_prophecy': 'prophesy',
            'perform_healing': 'heal',
            'perform_miracle': 'miracles',
            'trigger_intervention': 'divine_intervention',
            'create_universe': 'create_universe',
            'guard_realm': 'guard'
        };

        const requiredPermission = actionPermissions[action];
        return requiredPermission ? this.hasPermission(user, requiredPermission) : false;
    }

    getRoleDisplayName(role) {
        const roleInfo = this.getRoleInfo(role);
        return roleInfo ? roleInfo.name : role;
    }

    getRoleColor(role) {
        const roleInfo = this.getRoleInfo(role);
        return roleInfo ? roleInfo.color : '#666';
    }

    getRoleDescription(role) {
        const roleInfo = this.getRoleInfo(role);
        return roleInfo ? roleInfo.description : '';
    }

    // Role progression system
    canAdvanceRole(currentRole, targetRole) {
        const hierarchy = ['believer', 'priest', 'prophet', 'saint', 'angel', 'archangel'];
        const currentIndex = hierarchy.indexOf(currentRole);
        const targetIndex = hierarchy.indexOf(targetRole);

        return currentIndex !== -1 && targetIndex !== -1 && targetIndex > currentIndex;
    }

    getNextRole(currentRole) {
        const hierarchy = ['believer', 'priest', 'prophet', 'saint', 'angel', 'archangel'];
        const currentIndex = hierarchy.indexOf(currentRole);

        if (currentIndex === -1 || currentIndex === hierarchy.length - 1) return null;

        return hierarchy[currentIndex + 1];
    }

    // Divine role assignment (for special cases)
    assignDivineRole(user, newRole) {
        if (!this.roles[newRole]) {
            warn('Invalid role assignment:', newRole);
            return false;
        }

        user.role = newRole;
        appState.saveState();

        info('Divine role assigned:', user.name, '->', newRole);
        return true;
    }
}

// Singleton instance
const roleManager = new RoleManager();

export default roleManager;

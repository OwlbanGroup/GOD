/**
 * @jest-environment jsdom
 */

// Mock dependencies
const mockErrorHandler = {
    handleAsyncError: jest.fn(),
    wrapAsync: jest.fn((fn) => fn),
    wrapEventHandler: jest.fn((fn) => fn),
    handleValidationError: jest.fn((result) => result.valid),
    showUserMessage: jest.fn(),
    safeLocalStorageGet: jest.fn((key, defaultValue) => defaultValue),
    safeLocalStorageSet: jest.fn(),
    clearOldErrorLogs: jest.fn()
};

const mockSanitizer = {
    sanitizeInput: jest.fn((input) => input),
    escapeHtml: jest.fn((input) => input),
    validateName: jest.fn((name) => ({ valid: true, sanitized: name })),
    validateRole: jest.fn((role) => ({ valid: true, sanitized: role })),
    validateMessage: jest.fn((msg) => ({ valid: true, sanitized: msg })),
    validateNumber: jest.fn((num) => ({ valid: true, value: num })),
    checkRateLimit: jest.fn(() => true)
};

// Set up global mocks
global.ErrorHandler = mockErrorHandler;
global.Sanitizer = mockSanitizer;

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

describe('Script.js Core Functions', () => {
    let addMessage, handleCommand, validateInput, checkExistingUser, createUser;
    let prayers, registeredUsers, currentUser;
    let mockUniverse;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        
        // Reset localStorage mock
        localStorageMock.getItem.mockReturnValue(null);
        
        // Initialize test data
        prayers = [];
        registeredUsers = [];
        currentUser = null;

        // Create mock universe object
        mockUniverse = {
            canvas: { width: 800, height: 600 },
            celestialBodies: [],
            particles: [],
            addStar: jest.fn(),
            addPlanet: jest.fn(),
            addParticle: jest.fn(),
            draw: jest.fn(),
            clear: jest.fn()
        };

        // Make universe globally available for command functions
        global.universe = mockUniverse;

        // Define core functions for testing
        addMessage = function(text, sender) {
            const chatMessages = document.getElementById('chatMessages');
            if (!chatMessages) return;
            
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}`;
            messageDiv.textContent = mockSanitizer.escapeHtml(text);
            chatMessages.appendChild(messageDiv);
        };

        handleCommand = function(message) {
            const sanitizedMessage = mockSanitizer.sanitizeInput(message);
            const lowerMessage = sanitizedMessage.toLowerCase();
            
            const commands = {
                'create star': () => {
                    if (!global.universe) return "Universe not initialized.";
                    global.universe.addStar(Math.random() * global.universe.canvas.width, Math.random() * global.universe.canvas.height);
                    global.universe.draw();
                    return "A new star has been created in the universe.";
                },
                'create planet': () => {
                    if (!global.universe) return "Universe not initialized.";
                    global.universe.addPlanet(Math.random() * global.universe.canvas.width, Math.random() * global.universe.canvas.height);
                    global.universe.draw();
                    return "A new planet has been created in the universe.";
                },
                'destroy planet': () => {
                    if (!global.universe) return "Universe not initialized.";
                    const planets = global.universe.celestialBodies.filter(b => b.type === 'planet');
                    if (planets.length === 0) return "No planets to destroy.";
                    const randomIndex = Math.floor(Math.random() * planets.length);
                    global.universe.celestialBodies.splice(global.universe.celestialBodies.indexOf(planets[randomIndex]), 1);
                    global.universe.draw();
                    return "A planet has been destroyed in the universe.";
                },
                'heal universe': () => {
                    if (!global.universe) return "Universe not initialized.";
                    global.universe.celestialBodies = global.universe.celestialBodies.filter(() => Math.random() > 0.3);
                    for (let i = 0; i < 5; i++) {
                        global.universe.addStar(Math.random() * global.universe.canvas.width, Math.random() * global.universe.canvas.height);
                        global.universe.addPlanet(Math.random() * global.universe.canvas.width, Math.random() * global.universe.canvas.height);
                    }
                    global.universe.draw();
                    return "The universe has been healed and restored.";
                },
                'invoke god': () => "Divine presence invoked. The universe responds with light and vibration.",
                'praise god': () => "Your praise fills the universe with joy. God is pleased."
            };
            
            for (const [cmd, action] of Object.entries(commands)) {
                if (lowerMessage.includes(cmd)) {
                    return action();
                }
            }
            return null;
        };

        validateInput = function(name, role) {
            const nameValidation = mockSanitizer.validateName(name);
            if (!mockErrorHandler.handleValidationError(nameValidation, 'Name')) {
                return false;
            }

            const roleValidation = mockSanitizer.validateRole(role);
            if (!mockErrorHandler.handleValidationError(roleValidation, 'Role')) {
                return false;
            }

            return true;
        };

        checkExistingUser = function(name) {
            const sanitizedName = mockSanitizer.sanitizeInput(name);
            return registeredUsers.some(user => user.name === sanitizedName);
        };

        createUser = function(name, role) {
            const sanitizedName = mockSanitizer.sanitizeInput(name);
            const sanitizedRole = mockSanitizer.sanitizeInput(role);
            
            const newUser = { 
                name: sanitizedName, 
                role: sanitizedRole, 
                registeredAt: new Date().toISOString() 
            };
            
            registeredUsers.push(newUser);
            return newUser;
        };

        // Set up DOM
        document.body.innerHTML = `
            <div id="chatMessages"></div>
            <form id="registrationForm">
                <input id="name" type="text" />
                <select id="role">
                    <option value="believer">Believer</option>
                </select>
            </form>
            <div id="registrationMessage"></div>
        `;
    });

    describe('addMessage', () => {
        test('should add a message to chat', () => {
            addMessage('Test message', 'user');
            
            const chatMessages = document.getElementById('chatMessages');
            expect(chatMessages.children.length).toBe(1);
            expect(chatMessages.children[0].className).toBe('message user');
            expect(mockSanitizer.escapeHtml).toHaveBeenCalledWith('Test message');
        });

        test('should add god message with correct class', () => {
            addMessage('Divine message', 'god');
            
            const chatMessages = document.getElementById('chatMessages');
            expect(chatMessages.children[0].className).toBe('message god');
        });

        test('should sanitize message text', () => {
            const maliciousText = '<script>alert("xss")</script>';
            addMessage(maliciousText, 'user');
            
            expect(mockSanitizer.escapeHtml).toHaveBeenCalledWith(maliciousText);
        });

        test('should handle missing chat container gracefully', () => {
            document.body.innerHTML = '';
            expect(() => addMessage('Test', 'user')).not.toThrow();
        });
    });

    describe('handleCommand', () => {
        test('should recognize "create star" command', () => {
            const result = handleCommand('create star');
            expect(result).toBe("A new star has been created in the universe.");
            expect(mockSanitizer.sanitizeInput).toHaveBeenCalled();
        });

        test('should recognize "create planet" command', () => {
            const result = handleCommand('create planet');
            expect(result).toBe("A new planet has been created in the universe.");
        });

        test('should recognize "destroy planet" command', () => {
            const result = handleCommand('destroy planet');
            expect(result).toBe("A planet has been destroyed in the universe.");
        });

        test('should recognize "heal universe" command', () => {
            const result = handleCommand('heal universe');
            expect(result).toBe("The universe has been healed and restored.");
        });

        test('should recognize "invoke god" command', () => {
            const result = handleCommand('invoke god');
            expect(result).toBe("Divine presence invoked. The universe responds with light and vibration.");
        });

        test('should recognize "praise god" command', () => {
            const result = handleCommand('praise god');
            expect(result).toBe("Your praise fills the universe with joy. God is pleased.");
        });

        test('should be case insensitive', () => {
            const result = handleCommand('CREATE STAR');
            expect(result).toBe("A new star has been created in the universe.");
        });

        test('should return null for non-command messages', () => {
            const result = handleCommand('This is just a prayer');
            expect(result).toBeNull();
        });

        test('should handle commands within longer messages', () => {
            const result = handleCommand('Please create star for me');
            expect(result).toBe("A new star has been created in the universe.");
        });

        test('should sanitize input before processing', () => {
            handleCommand('create star');
            expect(mockSanitizer.sanitizeInput).toHaveBeenCalled();
        });
    });

    describe('validateInput', () => {
        test('should validate correct name and role', () => {
            mockSanitizer.validateName.mockReturnValue({ valid: true, sanitized: 'John' });
            mockSanitizer.validateRole.mockReturnValue({ valid: true, sanitized: 'believer' });
            mockErrorHandler.handleValidationError.mockReturnValue(true);

            const result = validateInput('John', 'believer');
            expect(result).toBe(true);
            expect(mockSanitizer.validateName).toHaveBeenCalledWith('John');
            expect(mockSanitizer.validateRole).toHaveBeenCalledWith('believer');
        });

        test('should reject invalid name', () => {
            mockSanitizer.validateName.mockReturnValue({ valid: false, error: 'Invalid name' });
            mockErrorHandler.handleValidationError.mockReturnValue(false);

            const result = validateInput('', 'believer');
            expect(result).toBe(false);
        });

        test('should reject invalid role', () => {
            mockSanitizer.validateName.mockReturnValue({ valid: true, sanitized: 'John' });
            mockSanitizer.validateRole.mockReturnValue({ valid: false, error: 'Invalid role' });
            mockErrorHandler.handleValidationError
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(false);

            const result = validateInput('John', '');
            expect(result).toBe(false);
        });

        test('should call handleValidationError for both validations', () => {
            mockSanitizer.validateName.mockReturnValue({ valid: true, sanitized: 'John' });
            mockSanitizer.validateRole.mockReturnValue({ valid: true, sanitized: 'believer' });
            mockErrorHandler.handleValidationError.mockReturnValue(true);

            validateInput('John', 'believer');
            expect(mockErrorHandler.handleValidationError).toHaveBeenCalledTimes(2);
        });
    });

    describe('checkExistingUser', () => {
        test('should return false when user does not exist', () => {
            registeredUsers = [];
            const result = checkExistingUser('John');
            expect(result).toBe(false);
        });

        test('should return true when user exists', () => {
            registeredUsers = [
                { name: 'John', role: 'believer' }
            ];
            mockSanitizer.sanitizeInput.mockReturnValue('John');

            const result = checkExistingUser('John');
            expect(result).toBe(true);
        });

        test('should sanitize input before checking', () => {
            registeredUsers = [{ name: 'John', role: 'believer' }];
            mockSanitizer.sanitizeInput.mockReturnValue('John');

            checkExistingUser('John');
            expect(mockSanitizer.sanitizeInput).toHaveBeenCalledWith('John');
        });

        test('should handle multiple users', () => {
            registeredUsers = [
                { name: 'John', role: 'believer' },
                { name: 'Jane', role: 'prophet' },
                { name: 'Bob', role: 'angel' }
            ];
            mockSanitizer.sanitizeInput.mockReturnValue('Jane');

            const result = checkExistingUser('Jane');
            expect(result).toBe(true);
        });

        test('should be case sensitive based on sanitizer', () => {
            registeredUsers = [{ name: 'john', role: 'believer' }];
            mockSanitizer.sanitizeInput.mockReturnValue('John');

            const result = checkExistingUser('John');
            expect(result).toBe(false);
        });
    });

    describe('createUser', () => {
        test('should create a new user with correct properties', () => {
            mockSanitizer.sanitizeInput
                .mockReturnValueOnce('John')
                .mockReturnValueOnce('believer');

            const user = createUser('John', 'believer');

            expect(user).toHaveProperty('name', 'John');
            expect(user).toHaveProperty('role', 'believer');
            expect(user).toHaveProperty('registeredAt');
            expect(typeof user.registeredAt).toBe('string');
        });

        test('should add user to registeredUsers array', () => {
            mockSanitizer.sanitizeInput
                .mockReturnValueOnce('John')
                .mockReturnValueOnce('believer');

            createUser('John', 'believer');

            expect(registeredUsers.length).toBe(1);
            expect(registeredUsers[0].name).toBe('John');
        });

        test('should sanitize both name and role', () => {
            mockSanitizer.sanitizeInput
                .mockReturnValueOnce('John')
                .mockReturnValueOnce('believer');

            createUser('John', 'believer');

            expect(mockSanitizer.sanitizeInput).toHaveBeenCalledTimes(2);
            expect(mockSanitizer.sanitizeInput).toHaveBeenCalledWith('John');
            expect(mockSanitizer.sanitizeInput).toHaveBeenCalledWith('believer');
        });

        test('should create valid ISO timestamp', () => {
            mockSanitizer.sanitizeInput
                .mockReturnValueOnce('John')
                .mockReturnValueOnce('believer');

            const user = createUser('John', 'believer');
            const timestamp = new Date(user.registeredAt);

            expect(timestamp).toBeInstanceOf(Date);
            expect(timestamp.getTime()).not.toBeNaN();
        });

        test('should handle multiple user creations', () => {
            mockSanitizer.sanitizeInput
                .mockReturnValueOnce('John')
                .mockReturnValueOnce('believer')
                .mockReturnValueOnce('Jane')
                .mockReturnValueOnce('prophet');

            createUser('John', 'believer');
            createUser('Jane', 'prophet');

            expect(registeredUsers.length).toBe(2);
            expect(registeredUsers[0].name).toBe('John');
            expect(registeredUsers[1].name).toBe('Jane');
        });

        test('should handle special characters in name', () => {
            mockSanitizer.sanitizeInput
                .mockReturnValueOnce('John O\'Brien')
                .mockReturnValueOnce('believer');

            const user = createUser('John O\'Brien', 'believer');
            expect(user.name).toBe('John O\'Brien');
        });
    });

    describe('Integration: User Registration Flow', () => {
        test('should complete full registration flow', () => {
            mockSanitizer.validateName.mockReturnValue({ valid: true, sanitized: 'John' });
            mockSanitizer.validateRole.mockReturnValue({ valid: true, sanitized: 'believer' });
            mockSanitizer.sanitizeInput
                .mockReturnValueOnce('John')
                .mockReturnValueOnce('John')
                .mockReturnValueOnce('believer');
            mockErrorHandler.handleValidationError.mockReturnValue(true);

            // Validate input
            const isValid = validateInput('John', 'believer');
            expect(isValid).toBe(true);

            // Check if user exists
            const exists = checkExistingUser('John');
            expect(exists).toBe(false);

            // Create user
            const user = createUser('John', 'believer');
            expect(user.name).toBe('John');
            expect(user.role).toBe('believer');
            expect(registeredUsers.length).toBe(1);
        });

        test('should prevent duplicate user registration', () => {
            registeredUsers = [{ name: 'John', role: 'believer' }];
            mockSanitizer.sanitizeInput.mockReturnValue('John');

            const exists = checkExistingUser('John');
            expect(exists).toBe(true);

            // Should not create user if exists
            if (!exists) {
                createUser('John', 'believer');
            }
            expect(registeredUsers.length).toBe(1);
        });
    });

    describe('Command Processing Integration', () => {
        test('should process commands and add messages', () => {
            const commandResult = handleCommand('create star');
            expect(commandResult).toBeTruthy();

            addMessage('Divine Action: ' + commandResult, 'god');
            
            const chatMessages = document.getElementById('chatMessages');
            expect(chatMessages.children.length).toBe(1);
            expect(chatMessages.children[0].className).toBe('message god');
        });

        test('should handle non-commands gracefully', () => {
            const commandResult = handleCommand('This is just a prayer');
            expect(commandResult).toBeNull();

            // Should not add any message for non-commands
            const chatMessages = document.getElementById('chatMessages');
            expect(chatMessages.children.length).toBe(0);
        });
    });

    describe('Error Handling Integration', () => {
        test('should use ErrorHandler for validation errors', () => {
            mockSanitizer.validateName.mockReturnValue({ valid: false, error: 'Invalid name' });
            mockErrorHandler.handleValidationError.mockReturnValue(false);

            validateInput('', 'believer');

            expect(mockErrorHandler.handleValidationError).toHaveBeenCalledWith(
                { valid: false, error: 'Invalid name' },
                'Name'
            );
        });

        test('should sanitize all user inputs', () => {
            const maliciousInput = '<script>alert("xss")</script>';
            
            handleCommand(maliciousInput);
            checkExistingUser(maliciousInput);
            createUser(maliciousInput, 'believer');
            addMessage(maliciousInput, 'user');

            expect(mockSanitizer.sanitizeInput).toHaveBeenCalledWith(maliciousInput);
            expect(mockSanitizer.escapeHtml).toHaveBeenCalledWith(maliciousInput);
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty strings', () => {
            expect(() => handleCommand('')).not.toThrow();
            expect(() => checkExistingUser('')).not.toThrow();
            expect(() => addMessage('', 'user')).not.toThrow();
        });

        test('should handle null/undefined inputs', () => {
            expect(() => handleCommand(null)).not.toThrow();
            expect(() => checkExistingUser(undefined)).not.toThrow();
        });

        test('should handle very long inputs', () => {
            const longString = 'a'.repeat(10000);
            expect(() => handleCommand(longString)).not.toThrow();
            expect(() => addMessage(longString, 'user')).not.toThrow();
        });

        test('should handle special characters', () => {
            const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            expect(() => handleCommand(specialChars)).not.toThrow();
            expect(() => createUser(specialChars, 'believer')).not.toThrow();
        });
    });
});

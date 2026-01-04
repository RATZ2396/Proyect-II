import { calculateClick, calculateRegen, GAME_CONSTANTS } from '../app/lib/gameLogic';

describe('Core Game Logic', () => {
    describe('calculateClick', () => {
        test('should decrease energy and increase balance on valid click', () => {
            const initialState = { energy: 10, balance: 0 };
            const result = calculateClick(initialState);

            expect(result.success).toBe(true);
            expect(result.newEnergy).toBe(10 - GAME_CONSTANTS.ENERGY_PER_CLICK);
            expect(result.newBalance).toBe(0 + GAME_CONSTANTS.TIMBITAS_PER_CLICK);
        });

        test('should fail when not enough energy', () => {
            const initialState = { energy: 0, balance: 10 };
            const result = calculateClick(initialState);

            expect(result.success).toBe(false);
            expect(result.newEnergy).toBe(0);
            expect(result.newBalance).toBe(10);
            expect(result.error).toBe('Not enough energy');
        });
    });

    describe('calculateRegen', () => {
        test('should regenerate energy based on time', () => {
            const startEnergy = 50;
            const seconds = 10;
            const newEnergy = calculateRegen(startEnergy, seconds);

            const expectedEnergy = 50 + (10 * GAME_CONSTANTS.REGEN_PER_SECOND);
            expect(newEnergy).toBe(expectedEnergy);
        });

        test('should not exceed max energy', () => {
            const startEnergy = 90;
            const seconds = 100; // Would be huge regen
            const newEnergy = calculateRegen(startEnergy, seconds);

            expect(newEnergy).toBe(GAME_CONSTANTS.MAX_ENERGY);
        });
    });
});

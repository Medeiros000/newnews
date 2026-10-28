import { NewsInsertionHandler } from './NewsInsertionHandler.js';

/**
 * @deprecated Use NewsInsertionHandler em seu lugar.
 */
export class PersistenceHandler extends NewsInsertionHandler {
    public getSavedCount(): number {
        return this.getInsertedCount();
    }
}

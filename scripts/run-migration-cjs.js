"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = __importDefault(require("postgres"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));

// Manually load .env files
const loadEnv = (fileName) => {
    const envPath = path_1.default.resolve(process.cwd(), fileName);
    if (fs_1.default.existsSync(envPath)) {
        console.log(`Loading env from ${fileName}`);
        const envContent = fs_1.default.readFileSync(envPath, 'utf8');
        console.log(`Content length of ${fileName}: ${envContent.length}`);
        const envConfig = dotenv_1.default.parse(envContent);
        for (const k in envConfig) {
            process.env[k] = envConfig[k];
        }
    }
};

loadEnv('.env');
loadEnv('.env.local');

console.log('Keys in process.env:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('SUPABASE')));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
}

const sql = (0, postgres_1.default)(connectionString);
function runMigration() {
    return __awaiter(this, void 0, void 0, function* () {
        const migrationFile = process.argv[2];
        if (!migrationFile) {
            console.error('Please provide a migration file path');
            process.exit(1);
        }
        const filePath = path_1.default.resolve(migrationFile);
        if (!fs_1.default.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            process.exit(1);
        }
        const migrationSql = fs_1.default.readFileSync(filePath, 'utf8');
        console.log(`Running migration from: ${migrationFile}`);
        try {
            yield sql.unsafe(migrationSql);
            console.log('Migration completed successfully');
        }
        catch (error) {
            console.error('Migration failed:', error);
            process.exit(1);
        }
        finally {
            yield sql.end();
        }
    });
}
runMigration();

export const QA_TARGET: Readonly<{host:"127.0.0.1";port:55443;database:"bluesass_payments_qa";username:"bluesass_qa_runtime"}>;
export interface LocalDatabaseOptions { host:"127.0.0.1";port:55443;database:"bluesass_payments_qa";username:"bluesass_qa_runtime";password:string;ssl:false;prepare:false;max:number;connect_timeout:number;idle_timeout:number;connection:{application_name:string;search_path:string;default_transaction_read_only:true}; }
export function localDatabaseOptions(raw: unknown, env?: Record<string,string | undefined>): Readonly<LocalDatabaseOptions>;
export function assertQaRuntimeApproved(): never;
export function createQaClient<T>(raw: unknown, env: Record<string,string | undefined>, factory:(options: Readonly<LocalDatabaseOptions>)=>T): T;
export function assertIdentityEvidence(evidence: unknown, expected: unknown): true;

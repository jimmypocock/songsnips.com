#!/usr/bin/env ts-node
/**
 * CloudFront Log Analyzer
 *
 * This script analyzes CloudFront logs stored in S3 to identify potential attack patterns.
 * Run this when you receive alerts to investigate further.
 *
 * Usage:
 *   npx ts-node scripts/analyze-cloudfront-logs.ts --bucket your-logs-bucket --prefix cloudfront/
 */
interface AnalysisResult {
    topIPs: Map<string, number>;
    topPaths: Map<string, number>;
    errorPaths: Map<string, number>;
    bandwidthByIP: Map<string, number>;
    suspiciousPatterns: string[];
    totalRequests: number;
    totalBandwidth: number;
    cacheHitRate: number;
}
declare function analyzeCloudFrontLogs(bucket: string, prefix: string, hoursBack?: number): Promise<AnalysisResult>;
declare function printAnalysisReport(result: AnalysisResult): void;
export { analyzeCloudFrontLogs, printAnalysisReport };

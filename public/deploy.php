<?php
/**
 * Webhook de GitHub para Auto-Deployment en Plesk
 *
 * Este script recibe webhooks de GitHub y ejecuta el script de deployment
 * cuando hay un push a la rama especificada.
 *
 * Configuración en GitHub:
 * 1. Ve a Settings > Webhooks > Add webhook
 * 2. Payload URL: https://tu-dominio.com/deploy.php
 * 3. Content type: application/json
 * 4. Secret: [Configura un secret seguro]
 * 5. Events: Just the push event
 */

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

// Secret compartido con GitHub (CAMBIA ESTO!)
define('GITHUB_SECRET', 'tu-secret-super-seguro-aqui-cambiame');

// Rama que dispara el deployment
define('DEPLOY_BRANCH', 'claude/fix-laravel-github-path-g0Yhx');

// Ruta al script de deployment
define('DEPLOY_SCRIPT', '/var/www/vhosts/crm-prueba.test/deploy.sh');

// Log de deployments
define('DEPLOY_LOG', '/var/www/vhosts/crm-prueba.test/logs/deploy.log');

// ============================================================================
// FUNCIONES
// ============================================================================

/**
 * Escribe en el log
 */
function writeLog($message) {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[{$timestamp}] {$message}\n";

    // Crear directorio de logs si no existe
    $logDir = dirname(DEPLOY_LOG);
    if (!file_exists($logDir)) {
        mkdir($logDir, 0755, true);
    }

    file_put_contents(DEPLOY_LOG, $logMessage, FILE_APPEND);
    echo $logMessage;
}

/**
 * Verifica la firma de GitHub
 */
function verifyGitHubSignature($payload, $signature) {
    if (empty($signature)) {
        return false;
    }

    $expectedSignature = 'sha256=' . hash_hmac('sha256', $payload, GITHUB_SECRET);
    return hash_equals($expectedSignature, $signature);
}

/**
 * Envía respuesta JSON
 */
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// ============================================================================
// MAIN
// ============================================================================

writeLog("=== Webhook recibido ===");

// Verificar método HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    writeLog("ERROR: Método no permitido: " . $_SERVER['REQUEST_METHOD']);
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Obtener payload
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Verificar firma de GitHub
if (!verifyGitHubSignature($payload, $signature)) {
    writeLog("ERROR: Firma inválida");
    sendJsonResponse(['error' => 'Invalid signature'], 403);
}

// Decodificar payload
$data = json_decode($payload, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    writeLog("ERROR: JSON inválido");
    sendJsonResponse(['error' => 'Invalid JSON'], 400);
}

// Verificar que es un evento de push
$event = $_SERVER['HTTP_X_GITHUB_EVENT'] ?? '';
if ($event !== 'push') {
    writeLog("INFO: Evento ignorado: {$event}");
    sendJsonResponse(['message' => 'Event ignored'], 200);
}

// Extraer información del push
$branch = $data['ref'] ?? '';
$branch = str_replace('refs/heads/', '', $branch);
$commits = $data['commits'] ?? [];
$repository = $data['repository']['full_name'] ?? 'unknown';
$pusher = $data['pusher']['name'] ?? 'unknown';

writeLog("Push recibido:");
writeLog("  Repositorio: {$repository}");
writeLog("  Rama: {$branch}");
writeLog("  Pusher: {$pusher}");
writeLog("  Commits: " . count($commits));

// Verificar que es la rama correcta
if ($branch !== DEPLOY_BRANCH) {
    writeLog("INFO: Rama ignorada (esperando {DEPLOY_BRANCH})");
    sendJsonResponse([
        'message' => 'Branch ignored',
        'branch' => $branch,
        'expected' => DEPLOY_BRANCH
    ], 200);
}

// Verificar que el script de deployment existe
if (!file_exists(DEPLOY_SCRIPT)) {
    writeLog("ERROR: Script de deployment no encontrado: " . DEPLOY_SCRIPT);
    sendJsonResponse(['error' => 'Deploy script not found'], 500);
}

// Verificar que el script es ejecutable
if (!is_executable(DEPLOY_SCRIPT)) {
    writeLog("WARN: Script no es ejecutable, intentando chmod...");
    chmod(DEPLOY_SCRIPT, 0755);
}

// Ejecutar script de deployment en background
writeLog("Ejecutando deployment...");

// Opción 1: Ejecución síncrona (espera a que termine)
// $output = shell_exec(DEPLOY_SCRIPT . ' 2>&1');

// Opción 2: Ejecución asíncrona (no espera, más rápido)
$command = DEPLOY_SCRIPT . ' >> ' . DEPLOY_LOG . ' 2>&1 &';
exec($command);

writeLog("Deployment iniciado en background");

// Listar commits
foreach ($commits as $commit) {
    $shortSha = substr($commit['id'], 0, 7);
    $message = $commit['message'];
    $author = $commit['author']['name'] ?? 'unknown';
    writeLog("  [{$shortSha}] {$message} - {$author}");
}

writeLog("=== Webhook procesado ===\n");

// Respuesta exitosa
sendJsonResponse([
    'success' => true,
    'message' => 'Deployment started',
    'branch' => $branch,
    'commits' => count($commits),
    'timestamp' => date('c')
], 200);

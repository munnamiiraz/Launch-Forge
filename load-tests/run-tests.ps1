# Load Test Helper Script

function Start-Infrastructure {
    Write-Host "Starting InfluxDB and Grafana..." -ForegroundColor Cyan
    docker-compose -f load-tests/docker-compose.yml up -d influxdb grafana
}

function Run-Test {
    param($ScriptName = "test.js")
    Write-Host "Running k6 test: $ScriptName..." -ForegroundColor Cyan
    docker-compose -f load-tests/docker-compose.yml run --rm k6 run /scripts/$ScriptName
}

function Stop-Infrastructure {
    Write-Host "Stopping load test infrastructure..." -ForegroundColor Yellow
    docker-compose -f load-tests/docker-compose.yml down
}

# Example usage instructions:
# . .\load-tests\run-tests.ps1
# Start-Infrastructure
# Run-Test

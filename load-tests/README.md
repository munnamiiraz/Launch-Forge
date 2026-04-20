# Load Testing with k6, InfluxDB, and Grafana

This setup allows you to run load tests against your API and visualize the results in real-time using Grafana.

## Prerequisites
- Docker and Docker Compose installed.

## Getting Started

1. **Start the Infrastructure:**
   ```bash
   cd load-tests
   docker-compose up -d influxdb grafana
   ```

2. **Run a Test:**
   ```bash
   docker-compose run k6 run /scripts/test.js
   ```

3. **View Results:**
   - Open Grafana at [http://localhost:3001](http://localhost:3001)
   - Login: (Anonymous access is enabled as Admin)
   - The datasource is pre-configured.
   - To add a dashboard, go to **Dashboards > Import** and use ID `2587` (the official k6 dashboard).

## Project Structure
- `scripts/`: Contains your k6 test scripts (JavaScript).
- `grafana/`: Provisioning configurations for Grafana.
- `docker-compose.yml`: Defines the stack (k6, InfluxDB, Grafana).

## Tips
- To test the host machine from within Docker, use `http://host.docker.internal:5000` as the base URL.
- Modify `scripts/test.js` to add more scenarios or target different endpoints.

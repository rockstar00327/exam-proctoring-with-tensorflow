# Internet Speed Test Implementation

This document describes the implementation of the internet speed test functionality in the AI Proctor application.

## Overview

The speed test measures three key metrics:
1. **Latency**: The time it takes for a request to travel from the client to the server and back (in milliseconds).
2. **Download Speed**: The speed at which data can be downloaded from the internet (in Mbps).
3. **Upload Speed**: The speed at which data can be uploaded to the internet (in Mbps).

## Backend Implementation

The backend provides a REST API endpoint for performing speed tests:

- **Endpoint**: `GET /api/speedtest/test`
- **Response**:
  ```json
  {
    "success": true,
    "download": 45.67,
    "upload": 23.45,
    "ping": 12.34,
    "server": {
      "name": "Example Server",
      "location": "New York",
      "country": "US",
      "host": "example.com"
    },
    "isp": "Example ISP",
    "ip": "123.45.67.89",
    "timestamp": "2023-06-28T12:00:00.000Z"
  }
  ```

### Configuration

The speed test can be configured via `backend/config/speedTest.js`:

- `maxTime`: Maximum test duration (ms)
- `serverSelection`: Criteria for selecting test servers
- `rateLimit`: Request rate limiting
- `timeouts`: Timeouts for different test phases

## Frontend Implementation

The frontend provides a user interface for running speed tests and displaying results:

1. **Component**: `InternetCheck.jsx`
2. **Key Features**:
   - Real-time progress updates
   - Fallback to client-side testing if server is unavailable
   - Detailed error reporting
   - Responsive design

## Fallback Mechanism

If the backend speed test fails, the frontend falls back to a client-side test that:
1. Downloads a small file to measure download speed
2. Estimates upload speed as 70% of download speed
3. Uses the health check endpoint to measure latency

## Security Considerations

- Rate limiting is implemented to prevent abuse
- CORS is properly configured
- Sensitive information is not exposed in error messages

## Testing

1. **Backend Test**:
   ```bash
   curl http://localhost:5000/api/speedtest/test
   ```

2. **Health Check**:
   ```bash
   curl http://localhost:5000/api/health
   ```

## Troubleshooting

1. **Test Fails**:
   - Check backend logs for errors
   - Verify network connectivity
   - Ensure CORS is properly configured

2. **Slow Tests**:
   - Adjust timeouts in the config
   - Check server load
   - Verify network conditions

3. **Inaccurate Results**:
   - Ensure no other applications are using bandwidth
   - Try a different test server
   - Run multiple tests for consistency

## Dependencies

- Backend: `speedtest-net`
- Frontend: `axios`

## License

This project is licensed under the [MIT License](LICENSE).

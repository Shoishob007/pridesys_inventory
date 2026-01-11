# Home Inventory

This is a Next.js application for tracking and organizing your belongings.

## How to Run

1.  Install the dependencies:
    ```bash
    npm install
    ```
2.  Create a `.env.local` file in the root of the project and add the following environment variable:
    ```
    NEXT_PUBLIC_API_URL=http://4.213.57.100:3100
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5000`.

## Environment Variables

- `NEXT_PUBLIC_API_URL`: The base URL of the API.

## Authentication

Authentication is handled using a token-based system. When a user logs in, the application sends a POST request to the `/api/login` endpoint with the user's credentials. If the credentials are valid, the API returns a JSON Web Token (JWT). This token is then stored in the browser's `localStorage` and is sent with each subsequent request to the API to authenticate the user.

## Tradeoffs and Next Steps

### Tradeoffs

- **Security:** The JWT is stored in `localStorage`, which can be vulnerable to Cross-Site Scripting (XSS) attacks. A more secure approach would be to use HTTP-only cookies to store the token.
- **Validation:** The login form has basic client-side validation, but there is no explicit server-side validation shown, which is a potential security risk.

### Next Steps

- **Improve Security:** Implement HTTP-only cookies for storing the JWT to enhance security.
- **Add Registration Page:** Create a user interface for registration so that new users can create an account.
- **Server-Side Validation:** Add robust server-side validation for all API endpoints to improve security and data integrity.
- **Implement refresh tokens:** For a better user experience and improved security, implement refresh tokens to allow users to stay logged in for longer periods without having to re-enter their credentials.

## Known Issues

- **Incomplete Item and Location Data:** Currently, some properties for items and locations are not being displayed correctly. This could be due to a discrepancy between the data structure expected by the frontend and the actual data returned by the API. It might also be a client-side issue with data fetching or state management. Further debugging is required to pinpoint the exact cause. The frontend components are built to display the full data, so once the issue is resolved, the UI will update accordingly.

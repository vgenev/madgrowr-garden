# Verdant: Regenerative Garden Planner

[cloudflarebutton]

> An illustrative and intuitive web app to help you manage your small garden, plan crop rotations, and practice regenerative techniques.

## About The Project

Verdant is a visually stunning and whimsical web application designed for small-scale gardeners who practice or are interested in regenerative agriculture. It provides tools to manage garden beds, track crops from planting to harvest, and log essential field operations.

The core experience revolves around a beautiful, illustrative dashboard that visually represents the user's garden. Users can add, arrange, and manage their vegetable beds. For each bed, they can log crops, specifying planting dates and varieties. The application includes a dynamic calendar that automatically populates with planting schedules, estimated harvest times, and user-created tasks.

Emphasizing regenerative principles, future phases will introduce features for crop rotation suggestions, companion planting guides, and a soil health journal, making it a comprehensive tool for nurturing a thriving garden ecosystem.

## Key Features

-   **Visual Garden Dashboard:** An illustrative, whimsical representation of your garden beds for an at-a-glance overview.
-   **Bed & Planting Management:** Full CRUD functionality to create, view, update, and delete garden beds and the crops planted within them.
-   **Interactive Calendar:** A dynamic calendar to visualize planting dates, estimated harvests, and scheduled tasks.
-   **Task Management:** A dedicated system for creating and tracking all your gardening to-dos.
-   **Responsive Design:** A beautiful and functional experience across all devices, from mobile phones to desktops.
-   **Regenerative Focus:** Built with future features for crop rotation, companion planting, and soil health in mind.

## Technology Stack

This project is a full-stack application built with modern, high-performance technologies.

-   **Frontend:**
    -   **Framework:** React (with Vite)
    -   **Language:** TypeScript
    -   **Styling:** Tailwind CSS
    -   **UI Components:** shadcn/ui
    -   **State Management:** Zustand
    -   **Animations:** Framer Motion
    -   **Forms:** React Hook Form with Zod for validation
-   **Backend:**
    -   **Runtime:** Cloudflare Workers
    -   **Framework:** Hono
-   **Storage:**
    -   **Database:** Cloudflare Durable Objects for consistent, stateful storage.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following tools installed on your machine:
-   Node.js (v18.0 or later)
-   Bun (`curl -fsSL https://bun.sh/install | bash`)
-   Wrangler CLI (`bun install -g wrangler`)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/verdant_garden_planner.git
    cd verdant_garden_planner
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Run the development server:**
    This command starts the Vite frontend and the Wrangler development server for the backend worker simultaneously.
    ```sh
    bun dev
    ```

4.  Open your browser and navigate to `http://localhost:3000` to see the application in action.

## Development

The project is organized into three main directories:

-   `src/`: Contains the entire React frontend application, including pages, components, hooks, and utility functions.
-   `worker/`: Contains the Cloudflare Worker backend code, built with Hono. This is where API routes and business logic reside.
-   `shared/`: Holds TypeScript types and interfaces that are shared between the frontend and backend to ensure type safety across the stack.

When developing, any changes made in these directories will trigger a hot-reload of the development server.

## Deployment

This application is designed for seamless deployment to the Cloudflare network.

1.  **Log in to Wrangler:**
    Authenticate the Wrangler CLI with your Cloudflare account.
    ```sh
    wrangler login
    ```

2.  **Deploy the application:**
    Run the deploy script. This will build the frontend application, then publish both the static assets and the worker to your Cloudflare account.
    ```sh
    bun deploy
    ```

Wrangler will provide you with the URL of your deployed application upon successful completion.

Alternatively, you can deploy this project with a single click:

[cloudflarebutton]
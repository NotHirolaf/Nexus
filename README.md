# Nexus - University Student Dashboard

A modern, glassmorphism-styled web application for university students (University of Toronto themed).

## Features
- **Dashboard**: Overview of classes, GPA, and tasks.
- **Timetable**: Weekly schedule grid.
- **Calculators**: 
  - **Grade Calculator**: Calculate course grades with weighted assessments.
  - **GPA Calculator**: Track cumulative and semester GPA.
- **To-Do List**: Task management with filters (Urgent, School, Personal).
- **Theme Support**: Dark Mode (default) and Light Mode.

## 🚀 How to Run Locally

If you are opening this project again later, follow these steps:

1.  **Open in VS Code**:
    *   Open VS Code.
    *   Go to **File** > **Open Folder...**
    *   Select `C:\Users\venan\OneDrive\Documents\Nexus`.

2.  **Start the Application**:
    *   Open a terminal (Terminal > New Terminal).
    *   Run the command:
        ```bash
        npm run dev
        ```
    *   Click the link shown (e.g., `http://localhost:5173`) to open it in your browser.

## 🛠 Project Setup (For new machines)

If you clone this repository on a different computer:

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/NotHirolaf/Nexus.git
    cd Nexus
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 🏗 Tech Stack
- **Framework**: React + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Router**: React Router DOM

## 📂 Project Structure
- `/src/components`: Reusable UI components (Sidebar, Layout).
- `/src/pages`: Individual page views (Dashboard, Timetable, Calculators).
- `/src/context`: React Context for global state (Theme).
- `/public`: Static assets (Logo).

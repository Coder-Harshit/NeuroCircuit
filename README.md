# NeuroCircuit 🧠
**Visual. Intuitive. Node-based AI Workflows**

Build your data pipelines like you’re connecting ideas — not writing boilerplate.
<br>
Inspired by **Blender’s Geometry Nodes & ComfyUI**.

[![DockerBuild CI](https://github.com/coder-harshit/NeuroCircuit/actions/workflows/ci.yml/badge.svg)](https://github.com/coder-harshit/NeuroCircuit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/github/license/Coder-Harshit/NeuroCircuit
)](https://opensource.org/licenses/MIT)
[![Join the Discord](https://img.shields.io/discord/1319962969878302730?logo=discord&logoColor=white)](https://discord.gg/PsRdg3AdD8)

## 🪟 Gallery
| ![NeuroCircuit Screenshot](Assets/Screenshots/Workflows/basic.png) | ![NeuroCircuit Screenshot-2](Assets/Screenshots/Workflows/vision.png) |
| -- | -- |

More shots can be found under [`Workflows Dir`](Assets/Screenshots/Workflows)

---

## 🚀 What is NeuroCircuit?

Think of NeuroCircuit as your AI/ML playground — a place where you can sketch out your ideas visually instead of fighting syntax.

Tired of writing the same “load CSV / clean data / run model” boilerplate again and again?
<br>
Here, you just **drop nodes, connect them, and watch it run**.


**Need data?**
> Drop a `Load CSV` node.

**Want to clean it?**
> Connect it to a `Handle Missing Values` node.

**Curious what’s happening?**
> Plug that into a `Display` node and peek inside.

---

## ⚡ Quick Run (For Users)

**Prerequisites:**
* [Docker Engine (or Desktop)](https://www.docker.com/products/docker-desktop/) must be installed and running.

**Steps:**

1.  **Download the Compose File:**

Save the `docker-compose.yml` file from this repository.
> **[Click here to download it](https://raw.githubusercontent.com/coder-harshit/NeuroCircuit/main/docker-compose.yml)**

2. **Run!**

Open a terminal in the *same directory* where you saved the file and run:
```bash
docker compose docker-compose.yml up
```

**That's it**! The application will be available at [http://localhost:5173](http://localhost:5173).

---

## Key Features ✨

* 📊 **Visual Graph Editor:** Drag, connect, and arrange nodes on an infinite canvas.
* 🧩 **Extensible Node System:** Easily add new custom nodes for data processing (like `pandas`) or computer vision (like `opencv`).
* ⚡ **Real-time Execution:** Send the visual graph to a powerful Python backend to execute the pipeline.
* 👀 **Live Debugging:** Use `DisplayNode` and `DisplayImageNode` to visualize the state of your data at any point in the workflow.
* 📦 **Dynamic Package Management:** Install new nodes and their Python dependencies directly from the UI.

---

## Tech Stack 🛠️

**Frontend:**   React   +   TypeScript  + React Flow  +   TailwindCSS

**Backend:**    Python  +   FastAPI

**DevOps:**     Docker  +   GitHub Actions (for CI/CD)

---

## 💬 Join the Community

Have questions, ideas, or just want to show off a workflow you built? Join our Discord server! We're just getting started and would love to have you.

[**Join the Official Discord Channel: HACKINGALGO**](https://discord.gg/PsRdg3AdD8)

---

## 🤝 Contributing & Development

⚠️ NeuroCircuit is in its early days and **under active construction**.

If you're excited by the vision of making AI/ML development more visual and intuitive, I'd love for you to contribute.

### How to Contribute

1.  Fork the repository.
2.  Create a new branch for your feature or bugfix.
3.  Make your changes. (See `CONTRIBUTE.md` for guidelines on creating new nodes!)
4.  Submit a **Pull Request** with a clear description of what you've done.

### Local Development Setup

Want to run the app in development mode?

**Prerequisites:**
* Node.js (v22 or later)
* Python (v3.11 or later)
* `uv` (or `pip`) for Python package management

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Coder-Harshit/NeuroCircuit.git
    cd NeuroCircuit
    ```

2.  **Setup the Backend (Terminal 1):**
    ```bash
    cd backend
    uv pip install -r requirements.txt
    ```

3.  **Setup the Frontend (Terminal 2):**
    ```bash
    cd frontend
    npm install
    ```

4.  **Run the Servers:**

    * **Run Backend (Terminal 1):**
        ```bash
        # In the /backend directory
        uv run fastapi dev
        ```
        *(Backend will be at `http://localhost:8000`)*

    * **Run Frontend (Terminal 2):**
        ```bash
        # In the /frontend directory
        npm run dev
        ```
        *(Frontend will be at `http://localhost:5173`)*

---

## License 📜

This project is licensed under the [MIT License](LICENSE).

# NeuroCircuit 🧠
**Visual. Intuitive. Node-based AI Workflows**

Build your data pipelines like you’re connecting ideas — not writing boilerplate.
<br>
Inspired by **Blender’s Geometry Nodes & ComfyUI**.

![NeuroCircuit Screenshot](Assets/Screenshots/Workflows/basic.png)

---
## 🚀 What is NeuroCircuit?

Think of NeuroCircuit as your AI/ML playground — a place where you can sketch out your ideas visually instead of fighting syntax.

Tired of writing the same “load CSV / clean data / run model” boilerplate again and again?
<br>Here, you just **drop nodes, connect them, and watch it run**.


**Need data?**

    Drop a `Load CSV` node.

**Want to transform it?** 
    
    Plug it in a Transform node

**Curious what’s happening?** 

    Add a Display node and peek inside

---

## Key Features ✨

* 📊 **Visual Graph Editor:** Drag, connect, and arrange nodes on an infinite canvas.
* ⚙️ **Interactive Nodes:** Configure node parameters directly in the UI (e.g., file paths, processing methods).
* ⚡ **Real-time Execution:** Send the graph to a Python backend to execute the data pipeline.
* 👀 **Live Debugging:** Use `DisplayNode` to visualize the state of your data at any point in the workflow.
* 🧩 **Extensible Node System:** A clean, type-safe architecture for easily adding new custom nodes.

---

## Tech Stack 🛠️

**Frontend:**   React   +   TypeScript  + React Flow  +   Tailwind

**Backend:**    Python  +   FastAPI     + Pandas

---

## Getting Started

### Prerequisites

* Node.js (v22 or later)
* Python (v3.11 or later)
* `uv` or `pip` for Python package management

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Coder-Harshit/NeuroCircuit.git
    cd NeuroCircuit
    ```

2.  **Setup the Frontend:**
    ```bash
    cd frontend
    npm install
    ```

3.  **Setup the Backend:**
    ```bash
    cd ../backend
    # Using uv (recommended)
    uv pip install -r requirements.txt

    # Or using pip
    pip install -r requirements.txt
    ```

### Running the Application

You will need two separate terminals to run both the frontend and backend servers.

1.  **Run the Frontend:**
    ```bash
    # In the /frontend directory
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

2.  **Run the Backend:**
    ```bash
    # In the /backend directory
    # Using uv
    uv run fastapi dev
    ```
    The backend API will be available at `http://localhost:8000`.

---

## Join the Development! 🚧
⚠️ NeuroCircuit is in its Early days & *under **active construction***

If you're excited by the vision of making AI/ML development more visual, intuitive, and fun, I'd love for you to contribute.

    **Whether you're fixing a typo, building a complex new feature, or just have a great idea, your input is welcome!**

### Contribute 🤝

Want to get your hands dirty? The process is straightforward:

1. Fork the Repo.
2. Create a new branch for your feature or bugfix.
3. Make your changes.
4. Submit a **PR** with a clear description of what you've done.

## License 📜

This project is licensed under the [MIT License](LICENSE).
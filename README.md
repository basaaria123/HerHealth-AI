# HerHealth AI 🌸

### AI-Powered Women's Health Awareness and Symptom Insights

<p align="center">
  <img src="https://raw.githubusercontent.com/basaaria123/HerHealth-AI/main/Poster.jpg" alt="HerHealth AI Poster" width="100%">
</p>

<p align="center">
  AI-Powered Women's Health Awareness and Symptom Insights
</p>


HerHealth AI is an AI-powered women's health application designed to help users understand their symptoms and access personalized health insights. The platform provides structured information based on user-submitted symptoms and health details, making women's health information more accessible and easier to understand.

The project was developed for **recHERsion 2026** to promote women's health awareness through technology.

## ✨ Features

- **Symptom Assessment:** Collects user-provided symptom and health information.
- **AI-Powered Insights:** Generates structured health insights based on submitted information.
- **Input Validation:** Handles missing or invalid inputs with appropriate validation messages.
- **User-Friendly Interface:** Provides an accessible interface for entering health details and viewing results.
- **Error Handling:** Supports graceful error responses when requests cannot be processed.
- **Responsive Design:** Designed for use across desktop and mobile screen sizes.
- **Privacy Awareness:** Focuses on collecting only the information required for the assessment.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React |
| Backend | Python, FastAPI |
| API Documentation | Swagger UI, OpenAPI |
| Backend Server | Uvicorn |
| Deployment — Frontend | Vercel |
| Deployment — Backend | Render |
| Version Control | Git and GitHub |

*Update this table if your repository uses additional frameworks, libraries, or database services.*

## 📁 Project Structure

```text
HerHealth-AI/
├── frontend/             # React frontend application
├── backend/              # FastAPI backend application
│   ├── tests/            # Backend tests
│   ├── main.py           # API entry point (if applicable)
│   └── requirements.txt  # Python dependencies
├── .gitignore
└── README.md
```

The exact file structure may vary depending on the current repository implementation.

## ⚙️ Prerequisites

Before running the project, ensure you have installed:

- Python 3.10 or a compatible version required by the backend dependencies
- Node.js and npm
- Git
- A code editor such as Visual Studio Code

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/basaaria123/HerHealth-AI.git
cd HerHealth-AI
```

### 2. Set up the backend

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

**Windows:**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS/Linux:**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

If the application requires environment variables, create a `.env` file in the appropriate directory and configure the required values.

Do not commit API keys, credentials, or other secrets to GitHub.

### 4. Run the backend server

If `main.py` is located directly inside the `backend` directory and exposes the FastAPI application as `app`, run:

```bash
uvicorn main:app --reload
```

The backend will generally be available at:

```text
http://127.0.0.1:8000
```

### 5. Access the API documentation

Open the following URL in your browser:

```text
http://127.0.0.1:8000/docs
```

Swagger UI allows you to inspect the available endpoints, submit test requests, and review API responses.

### 6. Set up the frontend

Open a new terminal and navigate to the frontend directory from the repository root:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm install
```

Configure the frontend environment variables according to the API URL expected by the application. For example, if the frontend uses Vite:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Use the actual variable name expected by your frontend code.

### 7. Run the frontend

```bash
npm run dev
```

Open the local URL displayed in the terminal to use the application.

**Note:** Keep the backend and frontend servers running in separate terminals while testing locally.

## 🧪 Testing

The backend API can be tested using Swagger UI or the project's automated tests.

To run the backend tests, activate the virtual environment, navigate to the backend directory, and execute:

```bash
python -m pytest
```

If `pytest` is not included in the project dependencies, install it before running the tests.

Important test scenarios include:

- Valid symptom input
- Missing or invalid input
- Successful result generation
- Error handling
- Mobile and desktop layout consistency
- Privacy-related behavior

Verify that the actual results match the expected behavior before marking individual test cases as passed.

## 🌐 Deployment

### Backend — Render

1. Connect the GitHub repository to Render.
2. Configure the backend service to use the `backend` directory as its root directory, if applicable.
3. Install dependencies using `pip install -r requirements.txt`.
4. Configure the start command to match the location of the FastAPI application. For a root-level `main.py`, use:

   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

5. Add any required environment variables.
6. Deploy the service and verify that the health endpoint responds successfully.

### Frontend — Vercel

1. Import the GitHub repository into Vercel.
2. Set the frontend directory as the root directory if the project uses a separate `frontend` folder.
3. Configure the build settings according to the frontend framework.
4. Set the production API URL to the deployed Render backend URL.
5. Deploy the application and test the frontend-to-backend connection.

If the frontend and backend are hosted on different domains, configure the backend's CORS settings to allow the deployed frontend origin.

## 🔒 Privacy and Medical Disclaimer

HerHealth AI is intended for health awareness and informational support. Its outputs should not be treated as a medical diagnosis or a substitute for professional medical advice.

Users should consult qualified healthcare professionals for medical concerns. In an emergency, seek immediate medical assistance.

The application should handle health information responsibly and avoid collecting or exposing unnecessary personal data.

## 🔮 Future Enhancements

- Expand women's health education resources.
- Improve symptom assessment and insight generation.
- Add accessible multilingual support.
- Enhance accessibility and mobile usability.
- Strengthen automated testing and privacy safeguards.
- Introduce additional evidence-based health information.

## 👩‍💻 Contributors

Developed by the HerHealth AI team for **recHERsion 2026**.
- Basaaria Imroz
- Madiha
## 📄 License

A license has not been specified. Add an appropriate `LICENSE` file before distributing the project under an open-source license.

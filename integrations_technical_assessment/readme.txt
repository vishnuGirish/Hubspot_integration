Steps to Run the Application
==============================

1)Run Redis in the background: redis-server --daemonize yes

2)Navigate to the frontend directory and start the frontend: cd frontend && npm run start

3)Navigate to the backend directory and start the backend: cd backend && uvicorn main:app --reload
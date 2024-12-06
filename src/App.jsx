import React, { useRef, useState } from "react";

function App() {
  const canvasRef = useRef(null);
  const [prediction, setPrediction] = useState(null); // Stan na wynik predykcji
  const [isDrawing, setIsDrawing] = useState(false); // Czy rysujemy
  const [lastPosition, setLastPosition] = useState(null); // Ostatnia pozycja kursora

  // Funkcja do czyszczenia płótna
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPrediction(null);
  };

  const handleSubmit = async () => {
    const canvas = canvasRef.current;

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, "digit.png");

      try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        setPrediction(result.prediction);
      } catch (error) {
        console.error("Błąd podczas wysyłania obrazu:", error);
        setPrediction("Błąd predykcji. Sprawdź serwer.");
      }
    }, "image/png");
  };

  // Rysowanie linii na płótnie
  const drawLine = (x1, y1, x2, y2) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = "black";
    ctx.lineWidth = 10; // Grubość linii
    ctx.lineCap = "round"; // Zaokrąglone końce linii

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
  };

  // Rozpoczynanie rysowania
  const startDrawing = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setIsDrawing(true);
    setLastPosition({ x, y });
  };

  // Rysowanie w trakcie ruchu
  const draw = (event) => {
    if (!isDrawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (lastPosition) {
      drawLine(lastPosition.x, lastPosition.y, x, y);
    }

    setLastPosition({ x, y });
  };

  // Zakończenie rysowania
  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPosition(null);
  };

  return (
    <div className=" bg-gradient-to-r from-slate-900 to-slate-800 text-white min-h-screen">
      <h1 className="text-center p-4 text-4xl text- font-light ">
        Predykcja narysowanej cyfry
      </h1>
      <canvas
        ref={canvasRef}
        width="280"
        height="280"
        className="border-8 border-slate-600 rounded-2xl bg-white mx-auto mb-6"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <div className="flex justify-center   space-x-4">
        <button
          onClick={clearCanvas}
          className=" px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Wyczyść
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Wyślij do predykcji
        </button>
      </div>
      {prediction !== null && (
        <div className="flex justify-center mt-4 text-lg text-white font-semibold">
          <p>Predykcja: {prediction} </p>
        </div>
      )}
    </div>
  );
}

export default App;

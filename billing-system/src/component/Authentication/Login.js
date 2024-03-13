import { message } from "antd";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../AppContext";
import { BannerImg } from "../../assets/image";
import "./Authentication.css";
import html2canvas from "html2canvas";
import Modal from "../Modal";


function Login() {
  const { token, setToken, isLogged, setIsLogged } = useContext(AppContext);
  //login with credials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // log with face
  const videoRef = React.useRef(null);
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = React.useState();
  const [imgeBlob, setImageBlob] = React.useState(null);
  const [modelRegister, setModelRegister] = useState(false);
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState(5); // Initial countdown time

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) =>
        prevCountdown > 0 ? prevCountdown - 1 : 0
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      // Start face recognition when countdown reaches 0
      HandleWebCam();
    }
  }, [countdown]);

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleScreenshotButtonClick = () => {
    html2canvas(document.getElementById("screenshot-target")).then((canvas) => {
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Display captured image
          const capturedImageUrl = URL.createObjectURL(blob);
          setCapturedImage(capturedImageUrl);
          // Send image to server
          setImageBlob(blob);
        } else {
          console.error("Failed to convert canvas to blob");
        }
      }, "image/jpeg"); // Specify MIME type
    });
  };

  useEffect(() => {
    if (modelRegister) {
      startWebcam();
    }
  }, [capturedImage, modelRegister]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };
  // for web cam
  const HandleWebCam = () => {
    setModelRegister(true);
    // Function to start the webcam
    startWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  };

  const handleRegister = async () => {
    setLoading(true);
    setModelRegister(false);
    try {
      const formData = new FormData();
      formData.append("face_photo", imgeBlob, "screenshot.jpg");

      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();
      console.log("response:", responseData);

      if (responseData.success) {
        message.success(responseData.message);
        sessionStorage.setItem("token", responseData?.token);
        setToken(responseData?.token);
        setIsLogged(true);
        navigate("/");
      } else {
        throw new Error(responseData.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Failed to register:", error);
      message.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
      setCapturedImage(null);
      setImageBlob(null);
    }
  };

  return (
    <div className="main-container">
      <form className="form border shadow p-5 col-md-7">
        <h2 className="text-center mb-3">
          WELCOME TO <br /> OUR AUTOMATIC BILLING SYSTEM
        </h2>
        <div className="row align-items-center">
          <div className="col-md-4">
            <img src={BannerImg} width="100%" alt="Banner" />
          </div>
          <div className="col-md-8">
            <ul>
              <li>
                Revolutionizing billing systems with MERN, faceIO, Firebase, and
                Twilio.
              </li>
              <li>
                Automated face authentication and QR scanner for seamless
                payments.
              </li>
              <li>
                Integration with Razorpay for quick and efficient transactions.
              </li>
              <li>
                Real-time bills sent via email and SMS for your convenience.
              </li>
            </ul>
          </div>
        </div>
        <hr className="line-bold" />
        <p className="text-center text-success">
          Opening the face recognition window in {countdown} seconds...
        </p>
        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="shadow btn btn-primary px-5 mt-4"
            onClick={startWebcam}
          >
            Login
          </button>
        </div>
      </form>
      <Modal isOpen={modelRegister} onClose={() => setModelRegister(false)}>
        <>
          <h2>Webcam Scanner</h2>
          {capturedImage ? (
            <img src={capturedImage} alt="" />
          ) : (
            <video ref={videoRef} autoPlay playsInline id="screenshot-target" />
          )}
          <div className="d-flex justify-content-around mt-2">
            <button
              key="1"
              className="btn btn-primary m-1"
              onClick={handleScreenshotButtonClick}
              disabled={!capturedImage ? false : true}
            >
              CAPTURE
            </button>

            <button
              key="2"
              className="btn btn-warning m-1 text-white"
              disabled={capturedImage ? false : true}
              onClick={handleRetake}
            >
              RETAKE
            </button>

            <button
              key="3"
              className="btn btn-success m-1"
              onClick={handleRegister}
              disabled={capturedImage ? false : true}
            >
              ENROLE
            </button>

            <button
              key="4"
              className="btn btn-danger m-1"
              onClick={() => setModelRegister(false)}
            >
              CANCEL
            </button>
          </div>
        </>
      </Modal>
    </div>
  );
}

export default Login;

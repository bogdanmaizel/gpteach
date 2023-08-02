import "../../css/Dashboard.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import Button from "react-bootstrap/Button";
import { FloatingLabel, Form } from "react-bootstrap";
import { Card, InputGroup } from "react-bootstrap";
import axios from "axios";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

function Dashboard() {
	const userInfo = JSON.parse(localStorage.getItem("userinfo"));
	const nav = useNavigate();

	if (!userInfo || !userInfo.email || !userInfo.uid) {
		nav("/");
	}

	function handleLogout() {
		localStorage.clear();
		nav("/");
	}
	const inputRef = useRef();
	const [userprefs, setUserprefs] = useState({
		gender: "Other",
		studies: "",
		year: 0,
	});
	const [currentChatHistory, setCurrentChat] = useState([]);
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const clearChat = (e) => {
		e.persist();
		setCurrentChat([]);
		setDoc(doc(db, "/chat-history/" + userInfo.uid), {
			chatHistory: [],
		});
	}

	const changeGender = (e) => {
		e.persist();
		setUserprefs({
			...userprefs,
			gender: e.target.value,
		});
		console.log(userprefs);
		setDoc(doc(db, "/userprefs/" + userInfo.uid), {
			...userprefs,
			gender: e.target.value,
		}, { merge: true });
	}

	const changeStudies = (e) => {
		e.persist();
		setUserprefs({
			...userprefs,
			studies: e.target.value,
		});
		console.log(userprefs);
		setDoc(doc(db, "/userprefs/" + userInfo.uid), {
			...userprefs,
			studies: e.target.value,
		}, { merge: true });
	}

	const changeYear = (e) => {
		e.persist();
		setUserprefs({
			...userprefs,
			year: e.target.value,
		});
		console.log(userprefs);
		setDoc(doc(db, "/userprefs/" + userInfo.uid), {
			...userprefs,
			year: e.target.value,
		}, { merge: true });
	}

	function getPromptContext() {
		return "This is a conversation between a student and a teacher. The student is a " + userprefs.gender
			+ " who is studying " + userprefs.studies
			+ " and is in year " + userprefs.year
			+ ". Below is the student's question.\n";
	}

	function handleNewMessage() {
		const newMessage = getPromptContext() + inputRef.current.value;
		const apiOptions = {
			method: "POST",
			url: "https://api.ai21.com/studio/v1/j2-grande-instruct/complete",
			headers: {
				accept: "application/json",
				"content-type": "application/json",
				Authorization: process.env.REACT_APP_API_KEY,
			},
			data: {
				frequencyPenalty: { scale: 1 },
				presencePenalty: { scale: 0 },
				maxTokens: 500,
				temperature: 0.4,
				prompt: newMessage,
			},
		};
		axios.request(apiOptions)
			.then(function (response) {
				setCurrentChat([...currentChatHistory, "User: " + inputRef.current.value, "EduGPT: " + response.data.completions[0].data.text]);
				setDoc(doc(db, "/chat-history/" + userInfo.uid), {
					chatHistory: ["User: " + inputRef.current.value, "EduGPT: " + response.data.completions[0].data.text],
				}, { merge: true });
			})
			.catch(function (error) {
				console.error(error);
			});
		//setCurrentChat([...currentChatHistory, "User: " + newMessage, "EduGPT: This is my response to the message '" + newMessage + "'"]);
		inputRef.current.value = "";
	}

	useEffect(() => {
		getDoc(doc(db, "/userprefs/" + userInfo.uid)).then((docSnap) => {
			if (docSnap.exists()) {
				setUserprefs(docSnap.data());
			} else {
				nav('/');
			}
		});
	}, []);

	return (
		<div>
			<Button className="Offcanvas-button" variant="outline" size="lg" onClick={handleShow}>
				≡
			</Button>
			<h1 className="Dashboard-title">Welcome, {userInfo.email.split("@")[0]}</h1>
			<Offcanvas show={show} onHide={handleClose}>
				<Offcanvas.Header closeButton>
					<Offcanvas.Title>Personal information</Offcanvas.Title>
				</Offcanvas.Header>
				<Offcanvas.Body>
					Gender:
					<InputGroup>
						<Form.Group controlId="gender">
							<Form.Check inline label="Male" value='Man' name="gender" type="radio" checked={userprefs.gender === 'Man'} onChange={changeGender} />
							<Form.Check inline label="Female" value='Woman' name="gender" type="radio" checked={userprefs.gender === 'Woman'} onChange={changeGender}/>
						</Form.Group>
					</InputGroup>
					<br/>
					<InputGroup>
						<FloatingLabel controlId="floatingStudiesGrid" label="Studies:">
							<Form.Control as="select" defaultValue={userprefs.studies} onChange={changeStudies}>
							<option value="">Choose...</option>
							<option value="HS">High school</option>
							<option value="Computer Science">Computer Science</option>
							<option value="Mathematics">Mathematics</option>
							<option value="Biiology">Biology</option>
							<option value="History">History</option>
							<option value="Geography">Geography</option>
							<option value="English">English</option>
							<option value="French">French</option>
							</Form.Control>
						</FloatingLabel>
					</InputGroup>
					<br />
					<InputGroup>
						<FloatingLabel controlId="floatingAgeGrid" label="Year of studies:">
							<Form.Control as="select" defaultValue={userprefs.year} onChange={changeYear}>
								<option value={0}>Choose...</option>
								<option value={1}>1st year</option>
								<option value={2}>2nd year</option>
								<option value={3}>3rd year</option>
								<option value={4}>4th year</option>
							</Form.Control>
						</FloatingLabel>
					</InputGroup>
				</Offcanvas.Body>
				<Button variant="danger" size="lg" onClick={handleLogout}>
					Log out
				</Button>
			</Offcanvas>

			<Card className="Chat-window">
				<Card.Body>
					<Card.Title>Chat</Card.Title>
					<Button  className="Chat-clear-button" variant="danger" size="sm" onClick={clearChat} >Clear chat</Button>
					<Card.Text>
						{currentChatHistory.map((message) => {
							return <p>{message}</p>;
						})}
					</Card.Text>
					<InputGroup>
						<InputGroup.Text>Enter custom prompt: </InputGroup.Text>
						<Form.Control ref={inputRef} as="textarea" aria-label="'Create a lecture plan...'" />
						<Form.Control className="Chat-input-button" as="button" onClick={handleNewMessage} variant="primary">
							Enter prompt
						</Form.Control>
					</InputGroup>
					<InputGroup>
						<InputGroup></InputGroup>
					</InputGroup>
				</Card.Body>
			</Card>
		</div>
	);
}

export default Dashboard;

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useRef, useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
	localStorage.clear();
	const [userStatus, setUserStatus] = useState(null);
	const mailRef = useRef();
	const passRef = useRef();
	const nav = useNavigate();

	async function submitRegister(event) {
		event.preventDefault();
		await createUserWithEmailAndPassword(auth, mailRef.current.value, passRef.current.value)
			.then((userCredential) => {
				// Signed in
				const user = userCredential.user;
				sendEmailVerification(user).then(() => {
					setUserStatus("A verification email has been sent to you.");
				});
				console.log(user);
			})
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				console.log(errorCode);
				console.log(errorMessage);
			});
		console.log("Submitted register");
	}

	async function submitLogin(event) {
		event.preventDefault();
		await signInWithEmailAndPassword(auth, mailRef.current.value, passRef.current.value)
			.then((userCredential) => {
				// Signed in
				const user = userCredential.user;
				console.log(user);
				if (user.emailVerified === false) {
					sendEmailVerification(user).then(() => {
						setUserStatus("Please verify your email.");
					});
				}
				if (user.emailVerified === true) {
					console.log("Email verified");
					setUserStatus(null);
					const userData = {
						accessToken: user.accessToken,
						email: user.email,
						uid: user.uid,
					};
					localStorage.setItem("userinfo", JSON.stringify(userData));
					nav("/dashboard");
				}
			})
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				console.log(errorCode);
				console.log(errorMessage);
				// ..
			});
		console.log("Submitted login");
	}

	return (
		<div>
			<h2>Log in</h2>
			<Form>
				<Form.Group controlId="formBasicEmail">
					<Form.Label>Email address</Form.Label>
					<Form.Control type="email" placeholder="Enter email" ref={mailRef} />
					<Form.Text className="text-muted">We will not share your email with anyone else.</Form.Text>
				</Form.Group>
				<Form.Group controlId="formBasicPassword">
					<Form.Label>Password</Form.Label>
					<Form.Control type="password" placeholder="Password" ref={passRef} />
				</Form.Group>
				<br />
				{userStatus && <Form.Text className="text-muted">{userStatus}</Form.Text>}
				<Button variant="primary" type="submit" onClick={submitLogin}>
					Login
				</Button>
				<Form.Text className="text-muted"> or </Form.Text>
				<Button variant="warning" type="submit" onClick={submitRegister}>
					Register
				</Button>
			</Form>
		</div>
	);
}

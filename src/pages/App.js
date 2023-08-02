import "../css/App.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import LoginForm from "./login/loginForm";
import { Button } from "react-bootstrap";

function App() {
	return (
		<Container fluid>
			<Row className="App">
				<h1>EduGPT Home Page</h1>
			</Row>
			<Row md={7}>
				<Col>
					<div>
						<h2 className="App">Who are we?</h2>
						<p className="App-description">
							EduGPT is a project that aims to integrate
							Large Language models, also known as LLMs, into the education system.
						</p>
						<Button variant="info" href="/about">Learn more</Button>
					</div>
				</Col>
				<Col xs={3}>
					<LoginForm />
				</Col>
			</Row>
		</Container>
	);
}

export default App;

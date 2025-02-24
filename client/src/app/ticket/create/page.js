import { useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import useRequest from "../../../customHook/useRequest";
import { useRouter } from "next/navigation";

export default async function SignUpPage() {
	const [title, setTitle] = useState("");
	const [price, setPrice] = useState("");
	const { data, sendRequest } = useRequest();
	const currentUser = await getCurrentUser();

	const handleSummit = (e) => {
		e.preventDefault();
		const router = useRouter();
		const dataPost = {
			title,
			price,
		};
		sendRequest("/api/tickets", "POST", dataPost, async () => {
			await new Promise((resolve) => setTimeout(resolve, 200));
			router.push("/");
		});
	};

	const onBlur = () => {
		const value = parseFloat(price);

		if (isNaN(value)) {
			return;
		}

		setPrice(value.toFixed(2));
	};

	if (!currentUser) {
		<Container>
			<h1>Haha</h1>
		</Container>;
	}

	return (
		<Container>
			<Row>
				<Col>
					<h1>Create a ticket</h1>
					<form onSubmit={(e) => handleSummit(e)}>
						<div className="mb-3">
							<label htmlFor="title" className="form-label">
								Title
							</label>
							<input
								type="title"
								className="form-control"
								id="title"
								aria-describedby="emailHelp"
								onChange={(e) => {
									setTitle(e.target.value);
								}}
							/>
						</div>
						<div className="mb-3">
							<label htmlFor="price" className="form-label">
								Price
							</label>
							<input
								type="price"
								className="form-control"
								id="price"
								onBlur={onBlur}
								onChange={(e) => {
									setPrice(e.target.value);
								}}
							/>
						</div>
						{data && data.errors && (
							<div className="alert alert-danger">
								<p>There is some error when create ticket. </p>
								<ul>
									{data.errors.map((error, index) => (
										<li key={index}>{error.msg}</li>
									))}
								</ul>
							</div>
						)}
						{data && data.msg && (
							<div className="alert alert-success" role="alert">
								You have successfully created a ticket.
							</div>
						)}
						<button type="submit" className="btn btn-primary">
							Submit
						</button>
					</form>
				</Col>
			</Row>
		</Container>
	);
}

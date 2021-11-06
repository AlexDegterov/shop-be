const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const cors = require('cors');
const app = express();

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const PORT = process.env.PORT || 3000;
const CART = process.env.CART;
const PRODUCT = process.env.PRODUCT;
const AppCache = new NodeCache({ stdTTL: 60 * 2 });

app.use(cors({
	origin: `http://localhost:${PORT}`
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('/*', (req, res) => {
	const recipient = req.originalUrl.split('/')[1];
	let recipientURL = process.env[recipient.toUpperCase()];
	if (req.query.id) {
		recipientURL = recipientURL + '/' + req.query.id;
	}

	if (recipient === 'product' && !req.query.id && req.method === 'GET') {
		let value = AppCache.get('getProductsList');

		if (value === undefined) {
			if (recipientURL) {
				axiosRequest(req, res, recipientURL)
					.then(data => {
						value = AppCache.set('getProductsList', data);
						if (value) { console.log(`Cache has been set to: \n ${data}.`) }
					})
					.catch(err => console.log(err))
			} else {
				res.status(502).json({ error: 'Cannot process request' });
			}
		} else {
			res.status(200).json(value);
		}
	} else {
		if (recipientURL) {
			axiosRequest(req, res, recipientURL)
				.then(data => {
					console.log('Request received!', data);
				})
				.catch(err => console.log(err))
		} else {
			res.status(502).json({ error: 'Cannot process request' });
		}
	}

	if (recipient === 'cart' && req.method === 'GET') {
		let value = AppCache.get('cart');

		if (value === undefined) {
			if (recipientURL) {
				axiosRequest(req, res, recipientURL)
					.then(data => {
						value = AppCache.set('cart', data);
						if (value) { console.log(`Cache has been set to: \n ${data}.`) }
					})
					.catch(err => console.log(err))
			} else {
				res.status(502).json({ error: 'Cannot process request' });
			}
		} else {
			res.status(200).json(value);
		}
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`)
});

const axiosRequest = (req, res, recipientURL) => {
	let axiosConfig = { method: req.method, url: recipientURL };
	if (req.body && Object.keys(req.body).length > 0) {
		axiosConfig.data = req.body;
	} else if (req.body && Object.keys(req.body).length == 0) {
		delete axiosConfig.data;
	}

	return axios(axiosConfig)
		.then((response) => {
			res.json(response.data);
			return response.data;
		})
		.catch(error => {
			if (error.response) {
				const { status, data } = error.response;
				res.status(status).json(data);
			} else {
				res.status(500).json({ error: error.message });
			}
		});
};
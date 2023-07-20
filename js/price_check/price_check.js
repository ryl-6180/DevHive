// JSでフォームを作成して追加
const formDiv = document.createElement("div");
formDiv.style.position = "fixed";
formDiv.style.top = "20px";
formDiv.style.right = "20px";
formDiv.style.backgroundColor = "#fff";
formDiv.style.border = "2px solid #f00";
formDiv.style.padding = "0.5rem";

const appLabel = document.createElement("label");
appLabel.value = "価格チェック";
appLabel.style.display = "block";
appLabel.style.fontSize = "1rem";

const shopCodeInput = document.createElement("input");
shopCodeInput.id = "shopCodeInput";
shopCodeInput.type = "text";
shopCodeInput.placeholder = "ショップコードを入力してください"; // テキストボックスにプレースホルダーを追加
shopCodeInput.style.fontSize = "1rem";
shopCodeInput.style.width = "17rem";
formDiv.appendChild(shopCodeInput);

const executeButton = document.createElement("button");
executeButton.textContent = "実行";
executeButton.addEventListener("click", startPriceCheck);
executeButton.style.fontSize = "1rem";
formDiv.appendChild(executeButton);

const progressCounter = document.createElement("p");
progressCounter.innerHTML = "進捗（0 / 0）";
formDiv.appendChild(progressCounter);

document.body.appendChild(formDiv);

// エンターキーで実行できるようにする
document.getElementById("shopCodeInput").addEventListener("keydown", function (event) {
	if (event.key === "Enter") {
		startPriceCheck();
	}
});

// アプリケーションIDを指定
const applicationId = "1008693261382501115";

// ヘルパーメソッド: スタイルを設定する関数
function setStyles(element, styles) {
	for (let prop in styles) {
		element.style[prop] = styles[prop];
	}
}

// 商品価格を取得してaタグに追加する関数
function addPriceToLink(apiEndpoint, link, keyword) {
	fetch(apiEndpoint)
		.then((response) => response.json())
		.then((data) => {
			const items = data.Items;
			let count = 0;
			for (const item of items) {
				if (item.Item.itemUrl.endsWith(keyword)) {
					const price = item.Item.itemPrice + "円"; // 商品価格を取得
					const priceNode = document.createTextNode(price);

					let wrapperDiv = document.createElement("div");
					// スタイルをまとめて設定する関数を呼び出す
					setStyles(wrapperDiv, {
						position: "absolute",
						zIndex: "9999",
						backgroundColor: "rgba(255,0,0,0.8)",
						color: "#fff",
						fontSize: "1.5rem",
						border: "2px solid red",
						padding: "1rem",
					});
					// 要素にテキストノードを追加
					wrapperDiv.appendChild(priceNode);
					// aタグの前に新しい要素を挿入
					link.parentNode.insertBefore(wrapperDiv, link);
					break;
				}
				count++;
			}
		})
		.catch((error) => console.error("Error:", error));
}

// リクエストを1秒ずつ間隔を空けて実行する関数
function executeRequestsSequentially(shopCode, links, currentIndex) {
	if (currentIndex >= links.length) {
		console.log("おわった");
		alert("オワリマシタ");
		return; // リンクの全ての要素を処理したら終了
	}

	let link = links[currentIndex];
	let url = link.href.split("/");
	let apiEndpoint = "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601?format=json&keyword=" + url[3] + "&shopCode=" + shopCode + "&applicationId=" + applicationId;
	// 商品価格を取得してaタグに追加する関数を呼び出す
	addPriceToLink(apiEndpoint, link, link.href.split("/").pop());

	progressCounter.innerHTML = "進捗（" + (currentIndex + 1) + " / " + links.length + "）";
	// 次のリクエストを1秒後に実行する
	setTimeout(function () {
		executeRequestsSequentially(shopCode, links, currentIndex + 1);
	}, 400);
}
// 実行ボタンをクリックしたときに処理を開始する関数
function startPriceCheck() {
	const inputElement = document.getElementById("shopCodeInput");
	if (inputElement.value == "") {
		alert("ショップコードを入力してください！");
		return;
	}
	const shopCode = inputElement.value;
	// ページ内のすべてのaタグを取得
	let allLinks = document.getElementsByTagName("a");
	let pattern = new RegExp("https://item\\.rakuten\\.co\\.jp/" + shopCode + "/[\\d\\-_]+");

	let matchedLinks = [];
	// 取得したすべてのaタグに対してループ処理
	for (let i = 0; i < allLinks.length; i++) {
		let link = allLinks[i];
		// リンクのURLが指定したパターンに一致するかチェック
		if (pattern.test(link.href)) {
			matchedLinks.push(link);
		}
	}
	// リクエストを1秒ずつ間隔を空けて実行する
	console.log("価格チェック開始");
	executeRequestsSequentially(shopCode, matchedLinks, 0);
}

const shopCode = "z-mall";
const applicationId = "1008693261382501115";

// ヘルパーメソッド: スタイルを設定する関数
function setStyles(element, styles) {
	for (let prop in styles) {
		element.style[prop] = styles[prop];
	}
}

// 商品価格を取得してaタグに追加する関数
function addPriceToLink(apiEndpoint, link, keyword) {
	console.log('addPriceToLink');
	fetch(apiEndpoint)
		.then((response) => response.json())
		.then((data) => {
			const items = data.Items;
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
			}
		})
		.catch((error) => console.error("Error:", error));
}

// リクエストを1秒ずつ間隔を空けて実行する関数
function executeRequestsSequentially(links, currentIndex) {
	console.log('executeRequestsSequentially');
	if (currentIndex >= links.length) {
		return; // リンクの全ての要素を処理したら終了
	}

	let link = links[currentIndex];
	let url = link.href.split("/");
	url.pop();
	let apiEndpoint = "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601?format=json&keyword=" + url.pop() + "&shopCode=" + shopCode + "&applicationId=" + applicationId;
	// 商品価格を取得してaタグに追加する関数を呼び出す
	addPriceToLink(apiEndpoint, link, link.href.split("/").pop());

	// 次のリクエストを1秒後に実行する
	setTimeout(function () {
		executeRequestsSequentially(links, currentIndex + 1);
	}, 500);
}

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
executeRequestsSequentially(matchedLinks, 0);
console.log('カカクチェック');

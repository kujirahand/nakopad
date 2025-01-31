// nadesiko init
const LSKEY = "nakoedit";	// ローカルストレージの保存キー

function nako3_run() {
	if (typeof(navigator.nako3) === 'undefined' || editor === undefined) {
		alert('現在ライブラリを読み込み中です。しばらくお待ちください。')
		return
	}
	const code = editor.getValue()
	var div_name = "#nako3_result"
	var canvas_name = "#nako3_canvas"
	var addon =
		"「" + div_name + "」へDOM親要素設定;" +
		"「" + div_name + "」に「」をHTML設定;" +
		"「" + canvas_name + "」へ描画開始;\n"
	const preCode = addon
	try {
		nako3_clear(2)
		navigator.nako3.runReset(preCode + code, "main.nako3", preCode)
		nako3_scr();
	} catch (e) {
		nako3_print("==ERROR==" + e.message + "")
		nako3_scr();
	}
}

const nako3_print = function (s) {
	var info = document.getElementById("nako3_info")
	if (!info) return
	var err = document.getElementById("nako3_error")
	if (!err) return
	s = "" + s // 文字列に変換

	var audio = document.querySelector("#audio1");
	
	// エラーだった場合
	if (s.substr(0, 9) == "==ERROR==") {
		s = s.substr(9)
		err.innerHTML = s
		err.style.display = 'block'
		info.style.display = 'none'
		audio.src = './audio/se_maoudamashii_system18.mp3';
	} else {
		info.innerHTML = to_html(s);
		info.style.display = 'block'
		err.style.display = 'none'
		audio.src = './audio/se_maoudamashii_system13.mp3';
	}
	nako3_scr();

	// エラー音
	audio.currentTime = 0;
	audio.play();
}

function to_html(s) {
	s = '' + s
	return s.replace(/\&/g, '&amp;')
			.replace(/\</g, '&lt;')
			.replace(/\>/g, '&gt;')
}

function scr_to_id( id ) {
	var el = document.getElementById( id );
	if (!el) return;
	var rect = el.getBoundingClientRect();
	var elemtop = rect.top + window.pageYOffset;
	window.scroll( 0, elemtop );
}

const nako3_clear = function (s) {
	// 引数0ならエラーとinfoだけ消す。1なら実行結果だけ。2なら全て。
	if ( s > 0 )	{
		var result = document.getElementById("nako3_result")
		if (!result) return
		// 要素を削除するように変更 21.3.20
		while(result.firstChild){
			result.removeChild(result.firstChild);
		}

		var canvas = document.getElementById("nako3_canvas")
		if (!canvas) return
		//canvas.style.visibility='hidden';
		var ctx = canvas.getContext('2d')
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		canvas.hidden = true;
	}

	if ( (s == 0) || (s == 2) ) {
		var err = document.getElementById("nako3_error")
		if (!err) return
		err.innerHTML = ''
		err.style.display = 'none'

		var info = document.getElementById("nako3_info")
		if (!info) return
		info.innerHTML = ''
		info.style.display = 'none'
	}
}

// load and save to local storage
const nako3_loadls = function () {
	try {
		var s = localStorage.getItem(LSKEY);
		if (!s) {
			nako3_print("==ERROR==ローカルストレージには，何も保存されていません");
		} else {
			const c = confirm("ローカルストレージに保存されているプログラムを読み込んでいいですか？");
			if (c) {
				nako3_clear(1);
				s = "" + s;
				editor.setValue(s, 1);
				nako3_print("ローカルストレージに保存されているプログラムを読み込みました");
				nako3_scrtop();
			}
		}
	} catch(e) {
		nako3_print(e);
	}
}

const nako3_savels = function (flag) {
	try {
		var c = false;
		if (flag > 0) {
			c = confirm("ローカルストレージにプログラムを保存していいですか？");
		} else {
			c = true;
		}
		
		if (c) {
			var s = editor.getValue();
				localStorage.setItem(LSKEY, s);
				nako3_print("ローカルストレージにプログラムを保存しました");
		}
	} catch(e) {
		nako3_print(e);
	}
}

const nako3_clearls = function (flag) {
	try {
		var c = false;
		if (flag > 0) {
			c = confirm("ローカルストレージに保存されているプログラムを消去していいですか？");
		} else {
			c = true;
		}
		
		if (c) {
			localStorage.removeItem(LSKEY);
			nako3_print("ローカルストレージに保存されているプログラムを消去しました");
		}
	} catch(e) {
		nako3_print(e);
	}
}

// load and save to file
const nako3_loadfile= function () {
	try {
		// file select
		const f = document.getElementById("nako3_file").files[0];
		if (!f) return;

		const c = confirm( f.name + " を読み込んでいいですか？");
		if (c) {
			const reader = new FileReader();
			reader.addEventListener('load', (event) => {
				editor.setValue( event.target.result, 1 );
				nako3_clear(2);
				nako3_print( f.name + " を読み込みました");
				nako3_scrtop();
				
				// 「保存」のファイル名欄に、ファイル名をセット
				var s = baseName( f.name );
				var fn = document.getElementById("nako3_filename");
				fn.value = s;
			});
			reader.readAsText(f);
		}
	} catch(e) {
		nako3_print(e);
	}
}

const nako3_loadsample= function () {
	try {
		// file select
		const sel = document.getElementById("nako3_sample");
		var fname = sel.value;
		if (!fname) return;
		var s = sel.options[ sel.selectedIndex ].text;
		
		const c = confirm( s + " を読み込んでいいですか？");
		if (c) {
			fetch( fname )
				.then((data) => {
					if (data.ok) {
						return data.text();
					} else {
						return Promise.reject(new Error('読み込み失敗'));
					}
				})
				.then((text) => {
					editor.setValue( text, 1 );
					nako3_clear(1);
					nako3_print( s + " を読み込みました");
					nako3_scrtop();
				})
				.catch(e => {
					// fetchできない場合
					nako3_print("==ERROR==" + e + "");
				});
		}
	} catch(e) {
		nako3_print(e);
	}
}

const nako3_loaddefault= function (editor) {
	if (!editor) return;
	try {
		// パラメータでファイル名を指定したらsanpleフォルダ内から読み込む 2021.4.30
		var params = (new URL( document.location )).searchParams;
		var fd = params.get('load');
		if( (fd === undefined) || (fd === null) ) {
			var f = "./default.txt";
		} else {
			var f = "./sample/" + fd;
		}
		var defs =	"クジラを絵追加。\n「こんにちは、クジラです。よろしくね。」と声出す。\n";
		fetch( f )
			.then((data) => {
				if (data.ok) {
					return data.text();
				} else {
					return Promise.reject(new Error('読み込み失敗'));
				}
			})
			.then((text) => {
				editor.setValue( text, 1 );
				nako3_scrtop();
			})
			.catch((e) => {
				editor.setValue( defs , 1);
				nako3_scrtop();
			});
	} catch(e) {
		editor.setValue( defs , 1);
		nako3_scrtop();
	}
}

const nako3_savefile= function () {
	try {
		// テキスト取得
		const txt = editor.getValue();
		if( txt.length < 1 ) {
			nako3_print( "==ERROR==保存するプログラムがありません。");
			return;
		}
		
		const f = document.getElementById("nako3_filename");
		if (!f) return;
		var fn = f.value;
		if ( fn.length < 1 ) {
			nako3_print( "==ERROR==ファイル名を入力してください。");
			return;
		} else {
			fn += ".txt";
		}
		
		// 文字をBlob化
		const blob = new Blob([txt], { type: 'text/plain' });
		
		// ダウンロード用のaタグ生成
		const a = document.getElementById("nako3_save");
		a.href = URL.createObjectURL( blob );
		a.download = fn;
		a.click();
		
		nako3_print( "プログラムを保存しました。保存したファイルは，ダウンロードフォルダにあります。" );
		//editor.focus();
	} catch(e) {
		nako3_print(e);
	}
}

// メディアファイルのObjectURLを取得する
const nako3_getObjURL= function () {
	try {
		// file select
		const f = document.getElementById("load_media").files[0];
		if (!f) return;

		objURL = URL.createObjectURL( f );
		editor.insert("「" + objURL + "」");	// カーソル位置にObjectURLを挿入
		editor.focus();
	} catch(e) {
		nako3_print(e);
	}
}

const nako3_click_load_media = function () {
	const fileElem = document.getElementById("load_media");
	if (fileElem) {
		fileElem.click();
	}
}

const nako3_click_loadfile = function () {
	const fileElem = document.getElementById("nako3_file");
	if (fileElem) {
		fileElem.click();
	}
}

const nako3_canvas_on = function () {
	var canvas = document.getElementById( "nako3_canvas" )
	if (!canvas) return
	//canvas.style.visibility='visible';
	canvas.hidden = false;
}

const nako3_canvas_off = function () {
	var canvas = document.getElementById( "nako3_canvas" )
	if (!canvas) return
	//canvas.style.visibility='hidden';
	canvas.hidden = true;
}

const nako3_getIP = function () {
  return IP;
}

// 独自関数の登録
var nako3_add_func = function () {
  navigator.nako3.setFunc("描画オン", [], nako3_canvas_on);
  navigator.nako3.setFunc("描画オフ", [], nako3_canvas_off);
}
var nako3_init_timer = setInterval(function(){
	if (typeof(navigator.nako3) === 'undefined') return
	clearInterval(nako3_init_timer)
	nako3_add_func()
}, 500);

// ファイル名から拡張子を取り除く
function baseName(str) {
	var base = new String(str).substring(str.lastIndexOf('/') + 1); 
	if( base.lastIndexOf(".") != -1 )       
		base = base.substring(0, base.lastIndexOf("."));
   return base;
}

// 「止める」ボタン…メディアの再生を停止
function nako3_break() {
	const media = document.getElementsByClassName('media');
	for (let i = 0; i < media.length; i++ ) {
		media[i].pause();
	}
	speechSynthesis.cancel();
}

// サンプルプログラムのオプションをこちらで定義 21.3.21  4/11追加
const SAMPLE_LIST = [
	{ value: './sample/sample-omikuji-1.txt', name: 'おみくじ1 もし～ならば' },
	{ value: './sample/sample-omikuji-2.txt', name: 'おみくじ2 もし～ならば～違えば' },
	{ value: './sample/sample-omikuji-3.txt', name: 'おみくじ3 もし～ならば～違えばもし' },
	{ value: '', name: '--' },
	{ value: './sample/sample-kazuate-1.txt', name: '数当て1 乱数と分岐' },
	{ value: './sample/sample-kazuate-2.txt', name: '数当て2 音を加える' },
	{ value: './sample/sample-kazuate-3.txt', name: '数当て3 反復' },
	//{ value: './sample/sample-kazuate-4.txt', name: '数当て4 ヒントを加える' },
	{ value: './sample/sample-kazuate-5.txt', name: '数当て5 フラグ変数を使う' },
	{ value: './sample/sample-kazuate.txt',   name: '数当てゲーム 豪華版' },
	{ value: '', name: '--' },
	{ value: './sample/sample-click10sec.txt', name: 'マウス練習 １０秒ゲーム' },
	{ value: './sample/sample-timer-1.txt',    name: '簡易タイマー' },
	{ value: '', name: '--' },
	{ value: './sample/sample-net00-ip.txt',  name: '双方向0 IPアドレスを調べる' },
	{ value: './sample/sample-net01-zipcode.txt',  name: '双方向1 郵便番号取得' },
	{ value: './sample/sample-net02-tenki.txt',    name: '双方向2 天気予報取得(1)' },
	{ value: './sample/sample-net03-pcr.txt',      name: '双方向3 PCR陽性者数取得' },
	{ value: './sample/sample-net04-weather2.txt', name: '双方向4 天気予報取得(2)' }
];

const nako3_init_samplelist = function () {
	var select = document.getElementById( "nako3_sample" )
	if (!select) return
	
	let optionstr = '<option value="">■お手本を選ぶ</option>';
	SAMPLE_LIST.forEach((item) => {
		optionstr += '<option value="' + item.value + '">' + item.name + '</option>';
	});
	select.innerHTML = optionstr;
}

// プログラムを消すボタンを設置 21.3.21
const nako3_clear_edit = function () {
	editor.setValue('');
	editor.focus();
}

// ファンクションキーで機能実行できるよう追加 2021.4.30
document.onkeydown = key_event;
function key_event() {
	// F1-F12キーならば，イベントを無効化する
	if( event.keyCode >=112 && event.keyCode <= 123 ) {
		event.keyCode = null;
		event.returnValue = false;
	}

	switch( event.keyCode ) {
		// F4キー LS保存
		case 115:
			nako3_savels(1);
			break;

		// F9キー 実行
		case 120:
			nako3_run();
			break;

		// F10キー 停止
		case 121:
			nako3_break();
			break;

		// F5キー LS読込
		case 116:
			nako3_loadls();
			break;


		// ctrl + alt + 9 実行
		case 57:
			if( event.ctrlKey && event.altKey )  nako3_run(); 
			break;

		// ctrl + alt + 0 停止
		case 48:
			if( event.ctrlKey && event.altKey ) nako3_break();
			break;

		// ctrl + alt + 4 LS保存
		case 52:
			if( event.ctrlKey && event.altKey ) nako3_savels(1);
			break;

		// ctrl + alt + 5 LS読込
		case 53:
			if( event.ctrlKey && event.altKey ) nako3_loadls();
			break;

		default:
			break;
	}
	return;
}

// スクロール処理の改善　2021.5.2
// 実行結果やinfoへスクロールする
function nako3_scr() {
	// UserAgentからのスマホ判定
	if (!(navigator.userAgent.match(/iPhone|Android.+Mobile/))) {
		editor.focus();
	}
	scr_to_id( "nako3_retop" );
}

// プログラムをロードした後に最上部へ戻す
function nako3_scrtop() {
	window.scroll( 0, 0 );
	// UserAgentからのスマホ判定
	if (!(navigator.userAgent.match(/iPhone|Android.+Mobile/))) {
		editor.focus();
		editor.gotoLine(1);
	}
}



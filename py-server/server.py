import threading
import http.server
import socketserver
import socket
from urllib.parse import urlparse, parse_qs
import os
import html
import getpass

ROOT = os.path.abspath(os.path.pardir)

def get_ip():
	s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
	try:
		# doesn't have to be reachable
		s.connect(("10.255.255.255", 1))
		IP = s.getsockname()[0]
	except Exception:
		IP = "127.0.0.1"
	finally:
		s.close()
	return IP

class HttpRequestHandler(http.server.SimpleHTTPRequestHandler):
	def do_GET(self):
		# Extract query param
		path_parsed = urlparse(f"{self.path}index.html" if self.path == "/" else self.path)
		
		response = ServerFakeFileHandler._handle(path_parsed)
		
		if "content" in response:
			utf8_bytes = response["content"] if isinstance(response["content"], (bytes, bytearray)) else bytes(response["content"], "utf8")
		else:
			utf8_bytes = []
		
		self.send_response(response["status_code"])

		# Setting the headers
		self.send_header("Content-Type", response["content_type"] if "content_type" in response else "text/html")
		self.send_header("Content-Length", str(len(utf8_bytes)))
		self.send_header("Connection", "keep-alive")
		self.send_header("Keep-Alive", "timeout=5, max=10")
		self.send_header("Cache-Control", "no-cache")

		# Whenever using 'send_header', you also have to call 'end_headers'
		self.end_headers()

		# Writing the HTML contents with UTF-8
		if len(utf8_bytes) > 0:
			self.wfile.write(utf8_bytes)

		return
	
	def log_message(self, format, *args): # disables log
		pass

class ServerFakeFileHandler:
	html_examples = (
		'<!DOCTYPE html>'
		'<html lang="en">'
			'<head>'
				'<meta charset="utf-8">'
				'<meta name="viewport" content="width=device-width, initial-scale=1">'
				'<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">'
				'<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css" rel="stylesheet" integrity="sha256-8M+b2Hj+vy/2J5tZ9pYDHeuPD59KsaEZn1XXj3xVhjg=" crossorigin="anonymous">'
				'<link href="/examples/style.css" rel="stylesheet">'
			'</head>'
			'<body>'
				'<pre><code>{0}</code></pre>'
				'<script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous" referrerpolicy="no-referrer"></script>'
				'<script src="/examples/script.js"></script>'
			'</body>'
		'</html>'
	)
	
	@staticmethod
	def _handle(path):
		attr = ServerFakeFileHandler._exists(ServerFakeFileHandler._get_filename(path.path))
		return {"status_code": 404} if attr is None else attr(parse_qs(path.query))
	
	@staticmethod
	def _exists(name):
		attr = getattr(ServerFakeFileHandler, f"root_{name}", None)
		return attr if callable(attr) else None
	
	@staticmethod
	def _get_filename(path):
		# new_path = path.split("/")[-1:][0].strip("\n\r\t\f /_").replace(".", "_")
		return path.strip("\n\r\t\f /_").replace(".", "_").replace("/", "_")
	
	@staticmethod
	def root_json(query):
		return {
			"status_code": 200,
			"content_type": "application/json",
			"content": '{"ಠ": "📺 sᴏᴍᴇᴛɪᴍᴇs ʏᴏᴜ ғɪɴᴅ ᴀɴ 🐇🥚 sᴏ ᴄᴏᴏʟ ʏᴏᴜ ɢᴏ 🤯"}'
		}
	
	@staticmethod
	def root_index_html(query):
		return ServerFakeFileHandler.root_html(query)
	
	@staticmethod
	def root_html(query):
		return {
			"status_code": 200,
			"content_type": "text/html",
			"content": open(os.path.join(ROOT, "index.html"), "rb").read()
		}
	
	@staticmethod
	def root_examples_html(query):
		return {
			"status_code": 200,
			"content_type": "text/html",
			"content": open(os.path.join(ROOT, "examples.html"), "rb").read()
		}
	
	@staticmethod
	def root_help_html(query):
		return {
			"status_code": 200,
			"content_type": "text/html",
			"content": open(os.path.join(ROOT, "help.html"), "rb").read()
		}
	
	@staticmethod
	def root_style_css(query):
		return {
			"status_code": 200,
			"content_type": "text/css",
			"content": open(os.path.join(ROOT, "style.css"), "rb").read()
		}
	
	@staticmethod
	def root_style_help_css(query):
		return {
			"status_code": 200,
			"content_type": "text/css",
			"content": open(os.path.join(ROOT, "style_help.css"), "rb").read()
		}
	
	@staticmethod
	def root_script_js(query):
		return {
			"status_code": 200,
			"content_type": "application/javascript",
			"content": open(os.path.join(ROOT, "script.js"), "rb").read()
		}
	
	@staticmethod
	def root_simply_js(query):
		return {
			"status_code": 200,
			"content_type": "application/javascript",
			"content": open(os.path.join(ROOT, "simply.js"), "rb").read()
		}
	
	@staticmethod
	def root_modules_canvas_js(query):
		return {
			"status_code": 200,
			"content_type": "application/javascript",
			"content": open(os.path.join(ROOT, "modules", "canvas.js"), "rb").read()
		}
	
	@staticmethod
	def root_modules_table_js(query):
		return {
			"status_code": 200,
			"content_type": "application/javascript",
			"content": open(os.path.join(ROOT, "modules", "table.js"), "rb").read()
		}
	
	
	# ========== EXAMPLES ==========
	@staticmethod
	def handle_example(dir, file):
		contents = open(os.path.join(ROOT, "examples", dir, f"{file}.simply"), "rb").read().decode("utf8")
		
		output = ServerFakeFileHandler.html_examples.format(html.escape(contents))
		
		return {
			"status_code": 200,
			"content_type": "text/html",
			"content": output
		}
	
	@staticmethod
	def root_examples_style_css(query):
		return {
			"status_code": 200,
			"content_type": "text/css",
			"content": open(os.path.join(ROOT, "examples/style.css"), "rb").read()
		}
	
	@staticmethod
	def root_examples_script_js(query):
		return {
			"status_code": 200,
			"content_type": "application/javascript",
			"content": open(os.path.join(ROOT, "examples/script.js"), "rb").read()
		}
	
	@staticmethod
	def root_examples_basics_hello_world_simply(query):
		return ServerFakeFileHandler.handle_example("basics", "hello_world")
	
	@staticmethod
	def root_examples_basics_doc_simply(query):
		return ServerFakeFileHandler.handle_example("basics", "doc")
	
	@staticmethod
	def root_examples_basics_variables_simply(query):
		return ServerFakeFileHandler.handle_example("basics", "variables")
	
	@staticmethod
	def root_examples_basics_output_simply(query):
		return ServerFakeFileHandler.handle_example("basics", "output")
	
	@staticmethod
	def root_examples_basics_functions_simply(query):
		return ServerFakeFileHandler.handle_example("basics", "functions")
	
	@staticmethod
	def root_examples_basics_if_unless_simply(query):
		return ServerFakeFileHandler.handle_example("basics", "if_unless")
	
	
	
	@staticmethod
	def root_examples_advanced_for_loops_simply(query):
		return ServerFakeFileHandler.handle_example("advanced", "for_loops")
	
	@staticmethod
	def root_examples_advanced_quine_simply(query):
		return ServerFakeFileHandler.handle_example("advanced", "quine")
	
	
	
	@staticmethod
	def root_examples_canvas_basic_simply(query):
		return ServerFakeFileHandler.handle_example("canvas", "basic")
	
	@staticmethod
	def root_examples_canvas_interactive_simply(query):
		return ServerFakeFileHandler.handle_example("canvas", "interactive")
	
	@staticmethod
	def root_examples_canvas_text_measure_simply(query):
		return ServerFakeFileHandler.handle_example("canvas", "text_measure")
	
	@staticmethod
	def root_examples_canvas_spritesheet_simply(query):
		return ServerFakeFileHandler.handle_example("canvas", "spritesheet")
	
	@staticmethod
	def root_examples_canvas_commodore64_simply(query):
		return ServerFakeFileHandler.handle_example("canvas", "commodore64")
	
	@staticmethod
	def root_examples_canvas_commodore64_maze_simply(query):
		return ServerFakeFileHandler.handle_example("canvas", "commodore64_maze")
	
	
	@staticmethod
	def root_examples_table_basic_simply(query):
		return ServerFakeFileHandler.handle_example("table", "basic")
	
	@staticmethod
	def root_examples_table_multiple_simply(query):
		return ServerFakeFileHandler.handle_example("table", "multiple")
	
	@staticmethod
	def root_examples_table_customizing_simply(query):
		return ServerFakeFileHandler.handle_example("table", "customizing")
	
	@staticmethod
	def root_examples_table_text_and_bg_simply(query):
		return ServerFakeFileHandler.handle_example("table", "text_and_bg")



PORT = 8888
# IP = get_ip()
IP = "localhost"


# Dance necessary to stop stupid errors like:
# ConnectionAbortedError: [WinError 10053]
# https://stackoverflow.com/questions/20745352/creating-a-multithreaded-server-using-socketserver-framework-in-python
class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
	pass


server = ThreadedTCPServer((IP, PORT), HttpRequestHandler)

server_thread = threading.Thread(target=server.serve_forever, daemon = True)

try:
	server_thread.start()

	print(f"Running server: http://{IP}:{PORT}")
	print(f"Serving files from: {ROOT}")
	print("Press Enter to close the server.")
	
	try:
		getpass.getpass(prompt="")
	except:
		input()
	
	print("Exitting...")
	exit(0)
except KeyboardInterrupt:
	print("Exitting...")
	exit(0)

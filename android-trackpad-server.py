import aiohttp
import pyautogui
from aiohttp import web


async def websocket_handler(request):

    ws = web.WebSocketResponse()
    await ws.prepare(request)

    async for msg in ws:
        if msg.type == aiohttp.WSMsgType.TEXT:
            x, y = msg.data.split('x')
            pyautogui.moveTo(int(x), int(y), 0.1, pyautogui.easeInQuad)

        elif msg.type == aiohttp.WSMsgType.ERROR:
            print('ws connection closed with exception %s' %
                  ws.exception())

    print('websocket connection closed')

    return ws

if __name__ == "__main__":
    application = web.Application()

    application.add_routes([web.get('/ws', websocket_handler)])

    web.run_app(application)






import aiohttp
import pyautogui
from aiohttp import web

pyautogui.PAUSE = 0

offset_x = offset_y = None
scaling_factor = 4


async def websocket_handler(request):

    global offset_x
    global offset_y

    ws = web.WebSocketResponse()
    await ws.prepare(request)

    async for msg in ws:
        if msg.type == aiohttp.WSMsgType.TEXT:
            if msg.data.startswith('letoff'):
                offset_x = offset_y = None
            elif msg.data.startswith('tapped'):
                pyautogui.click()
            else:
                x, y = msg.data.split('x')
                x = round(float(x), 0)
                y = round(float(y), 0)

                if offset_x is None or offset_y is None:
                    offset_x = x
                    offset_y = y
                else:
                    delta_x = (x - offset_x) * scaling_factor
                    delta_y = (y - offset_y) * scaling_factor
                    pyautogui.moveRel(delta_x, delta_y)
                    offset_x = x
                    offset_y = y

        elif msg.type == aiohttp.WSMsgType.ERROR:
            print('ws connection closed with exception %s' %
                  ws.exception())

    print('websocket connection closed')

    return ws

if __name__ == "__main__":
    application = web.Application()

    application.add_routes([web.get('/ws', websocket_handler)])

    web.run_app(application)






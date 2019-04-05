import aiohttp
import asyncio
import pyautogui
from aiohttp import web
from utils.aioudp import open_local_endpoint, open_remote_endpoint
from utils.get_ip import get_ip

pyautogui.PAUSE = 0
pyautogui.FAILSAFE = False

scaling_factor = 15


async def websocket_handler(request):

    ws = web.WebSocketResponse()
    await ws.prepare(request)

    async for msg in ws:
        if msg.type == aiohttp.WSMsgType.TEXT:
            if msg.data.startswith('letoff'):
                offset_x = offset_y = None
            elif msg.data.startswith('tapped'):
                pyautogui.click()
            else:
                print(msg.data)
                x, y = msg.data.split('x')
                x = round(float(x) * scaling_factor, 0)
                y = round(float(y) * scaling_factor, 0)

                pyautogui.moveRel(x, y)

        elif msg.type == aiohttp.WSMsgType.ERROR:
            print('ws connection closed with exception %s' %
                  ws.exception())

    print('websocket connection closed')

    return ws


async def listen_for_udp_pings():
    while True:
        broadcast = ('255.255.255.255', 50000)
        local = await open_local_endpoint(*broadcast)
        data, address = await local.receive()
        message = str(data, 'utf-8')
        print(f'Got message "{message}" from {address[0]} port {address[1]}')
        if message == "Android-Trackpad wants to know your IP":
            remote = await open_remote_endpoint(*address)
            print("Sending ip to remote")
            remote.send(f"Android-Trackpad IP: {get_ip()}".encode('utf-8'))
            print("Sent")
        else:
            print("Not interested in this UDP packet. Saying nothing.")


async def start_background_tasks(app):
    app['listen_for_udp_pings'] = asyncio.create_task(listen_for_udp_pings())


if __name__ == "__main__":
    application = web.Application()

    application.add_routes([web.get('/ws', websocket_handler)])
    application.on_startup.append(start_background_tasks)
    web.run_app(application)






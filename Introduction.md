# 一、简介：

### 1. 当前存在的模块

outline-client、outline-go-tun2xray、xray-core

### 2. 主要任务

将 outline-client 底层的 outline-go-tun2sock 移除掉，替换成 outline-go-tun2xray, 以实现 client 通过 tunnel 将流量转给 xray 代理。

### 3. 什么是 fd

文件描述符 (File descriptor) 是计算机科学中的一个术语，是一个用于表述指向文件的引用的抽象化概念。

文件描述符在形式上是一个非负整数。实际上, 它是一个索引值, 指向内核为每一个进程所维护的该进程打开文件的记录表。当程序打开一个现有文件或者创建一个新文件时, 内核向进程返回一个文件描述符。在程序设计中, 一些涉及底层的程序编写往往会围绕着文件描述符展开。但是文件描述符这一概念往往只适用于 UNIX、Linux 这样的操作系统。

每个 Unix 进程 (除了可能的守护进程) 应均有三个标准的 POSIX 文件描述符, 对应于三个标准流:

- 0 : stdin
- 1 : stdout
- 2 : stderr

### 4. tun/tap 模式

在计算机网络中, TUN 与 TAP 是操作系统内核中的虚拟网络设备。不同于普通靠硬件网络适配器实现的设备, 这些虚拟的网络设备全部用软件实现, 并向运行于操作系统上的软件提供与硬件的网络设备完全相同的功能。

TAP 等同于一个以太网设备, 它操作第二层数据包如以太网数据帧。TUN 模拟了网络层设备, 操作第三层数据包比如 IP 数据包。

操作系统通过 TUN/TAP 设备向绑定该设备的用户空间的程序发送数据, 反之, 用户空间的程序也可以像操作硬件网络设备那样, 通过 TUN/TAP 设备发送数据。在后种情况下, TUN/TAP 设备向操作系统的网络栈投递 (或“注入”) 数据包，从而模拟从外部接受数据的过程。

在 linux 上, tun 设备相当于创建了一个 /dev/tunX 的文件, tap 设备相当于创建了一个 /dev/tapX 的文件, X 为数字。

### 5 TAP 设备与 TUN 设备工作方式完全相同，区别在于：

- TUN 设备是一个三层设备，它只模拟到了 IP 层，即网络层 我们可以通过 /dev/tunX 文件收发 IP 层数据包，它无法与物理网卡做 bridge, 但是可以通过三层交换 (如 ip_forward) 与物理网卡连通。可以使用 ifconfig 之类的命令给该设备设定 IP 地址。

- TAP 设备是一个二层设备，它比 TUN 更加深入，通过 /dev/tapX 文件可以收发 MAC 层数据包，即数据链路层，拥有 MAC 层功能，可以与物理网卡做 bridge, 支持 MAC 层广播。同样的, 我们也可以通过 ifconfig 之类的命令给该设备设定 IP 地址，你如果愿意，我们可以给它设定 MAC 地址。

# 二、outline-client 与 outline-go-tun2xray 的对接

接口会返回一个 OutlineTunnel 对象，里面就包含了一个 Tunnel 接口，拥有 IsConnected 、 Disconnect 、 Write 三个方法。

```golang
// Tunnel represents a session on a TUN device.
type Tunnel interface {
	// IsConnected indicates whether the tunnel is in a connected state.
	IsConnected() bool
	// Disconnect disconnects the tunnel.
	Disconnect()
	// Write writes input data to the TUN interface.
	Write(data []byte) (int, error)
}
```

### 1. 安卓端

#### 旧接口:

```golang
package tun2socks

func ConnectShadowsocksTunnel(fd int, host string, port int, password, cipher string, isUDPEnabled bool) (OutlineTunnel, error)
```

- fd: 文件描述符, 跟 tun 设备关联
- host: shadowsocks 服务器的 ip
- port: shadowsocks 服务器的 port
- password: shadowsocks 服务器的访问密码 (已使用 cipher 加密)
- cipher: shadowsocks 服务器的访问密码的加密方式
- isUDPEnabled: 是否支持 UDP 流量

#### 新接口:

```golang
package tun2xray

func ConnectXrayTunnel(fd int, configType string, jsonConfig string, serverAddress string, serverPort int, userId string) (xray.OutlineTunnel, error)
```

- fd: 文件描述符, 跟 tun 设备关联
- configType: 配置类型, 目前分别为 param 和 json。
- jsonConfig: 配置 JSON 文件, 当 configType = json 时生效, 可以参考 https://github.com/XTLS/Xray-examples.git
- serverAddress: xray 服务器 ip, 当 configType = param 时生效
- serverPort: xray 服务器的端口, 当 configType = param 时生效
- userId: xray 配置的用户 ID, 一般都是一个 UUID 串, 当 configType = param 时生效

当 configType = param 时, tun2xray 服务会默认使用 vless + tcp + xtls 模式跟远程的 xray 服务器进行交互。

### 2. IOS、MacOS

#### 旧接口:

```golang
package tun2socks

func ConnectShadowsocksTunnel(tunWriter TunWriter, host string, port int, password, cipher string, isUDPEnabled bool) (OutlineTunnel, error)
```

- tunWriter: tun 设备输入流, 实际就是读取了 tunX 文件，这个需要在 client 侧处理。
- host: shadowsocks 服务器的 ip
- port: shadowsocks 服务器的 port
- password: shadowsocks 服务器的访问密码 (已使用 cipher 加密)
- cipher: shadowsocks 服务器的访问密码的加密方式
- isUDPEnabled: 是否支持 UDP 流量

#### 新接口:

```golang
package tun2xray

func ConnectXrayTunnel(tunWriter xray.TunWriter, configType, jsonConfig, serverAddress string, serverPort int, userId string) (xray.OutlineTunnel, error)
```

- tunWriter: tun 设备输入流, 实际就是读取了 tunX 文件，这个需要在 client 侧处理。
- configType: 配置类型, 目前分别为 param 和 json。
- jsonConfig: 配置 JSON 文件, 当 configType = json 时生效, 可以参考 https://github.com/XTLS/Xray-examples.git
- serverAddress: xray 服务器 ip, 当 configType = param 时生效
- serverPort: xray 服务器的端口, 当 configType = param 时生效
- userId: xray 配置的用户 ID, 一般都是一个 UUID 串, 当 configType = param 时生效

当 configType = param 时, tun2xray 服务会默认使用 vless + tcp + xtls 模式跟远程的 xray 服务器进行交互。

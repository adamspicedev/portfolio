import { BlockList, isIP } from 'node:net'

// Official Cloudflare proxy ranges. Recheck these when proxy routing changes:
// https://www.cloudflare.com/ips-v4 and https://www.cloudflare.com/ips-v6
const cloudflare = new BlockList()
cloudflare.addSubnet('173.245.48.0', 20, 'ipv4')
cloudflare.addSubnet('103.21.244.0', 22, 'ipv4')
cloudflare.addSubnet('103.22.200.0', 22, 'ipv4')
cloudflare.addSubnet('103.31.4.0', 22, 'ipv4')
cloudflare.addSubnet('141.101.64.0', 18, 'ipv4')
cloudflare.addSubnet('108.162.192.0', 18, 'ipv4')
cloudflare.addSubnet('190.93.240.0', 20, 'ipv4')
cloudflare.addSubnet('188.114.96.0', 20, 'ipv4')
cloudflare.addSubnet('197.234.240.0', 22, 'ipv4')
cloudflare.addSubnet('198.41.128.0', 17, 'ipv4')
cloudflare.addSubnet('162.158.0.0', 15, 'ipv4')
cloudflare.addSubnet('104.16.0.0', 13, 'ipv4')
cloudflare.addSubnet('104.24.0.0', 14, 'ipv4')
cloudflare.addSubnet('172.64.0.0', 13, 'ipv4')
cloudflare.addSubnet('131.0.72.0', 22, 'ipv4')
cloudflare.addSubnet('2400:cb00::', 32, 'ipv6')
cloudflare.addSubnet('2606:4700::', 32, 'ipv6')
cloudflare.addSubnet('2803:f800::', 32, 'ipv6')
cloudflare.addSubnet('2405:b500::', 32, 'ipv6')
cloudflare.addSubnet('2405:8100::', 32, 'ipv6')
cloudflare.addSubnet('2a06:98c0::', 29, 'ipv6')
cloudflare.addSubnet('2c0f:f248::', 32, 'ipv6')
function canonicalIp(value: string | null) {
  if (!value || value.includes('%') || !isIP(value)) return undefined
  return isIP(value) === 4
    ? value
    : new URL(`http://[${value}]/`).hostname.slice(1, -1)
}

/** Trust platform-overwritten peer metadata only on Vercel. A client-supplied
 * CF header on direct Vercel requests is ignored. Behind Cloudflare, its peer
 * must match the published proxy ranges before accepting the real-client field.
 * This is an IP trust boundary, not authentication of a particular CF account.
 */
export function trustedContactIp(headers: Headers, vercel: boolean) {
  if (!vercel) return undefined
  const peer = canonicalIp(headers.get('x-vercel-forwarded-for'))
  if (!peer) return undefined
  if (cloudflare.check(peer, isIP(peer) === 4 ? 'ipv4' : 'ipv6'))
    return canonicalIp(headers.get('cf-connecting-ip'))
  return peer
}

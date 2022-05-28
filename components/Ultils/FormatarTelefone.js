export default function formatarTelefone(v) {
    if (!v) {
        return ''
    }
    let r = v.replace(/\D/g, '')
    r = r.replace(/^0/, '')

    if (r.length >= 11) {
        r = r.replace(/^(\d{2})(\d)(\d{4})(\d{4}).*/, '($1) $2 $3-$4')
    }
    return r
}
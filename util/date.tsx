import parse from 'date-fns/parse'
import format from 'date-fns/format'

export function parseDate(dateString: string) {
    return parse(dateString, 'yyyy-MM-dd', new Date());
}

export function formatDate(date: Date) {
    return format(date, 'yyyy-MM-dd');
}
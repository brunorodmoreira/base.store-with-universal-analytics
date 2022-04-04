/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { AnalyticsEvent } from '@faststore/sdk'
import { useAnalyticsEvent } from '@faststore/sdk'

// @ts-ignore
import storeConfig from '../../../store.config'

if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer ?? []
}

type PageViewEvent = {
  name: 'page_view'
  params: {
    location: string
    page: string
    referrer: string
  }
}

const parseToUniversalAnalyticsData = (evt: AnalyticsEvent | PageViewEvent) => {
  switch (evt.name) {
    case 'view_item':
      return {
        event: 'productDetail',
        ecommerce: {
          detail: {
            products: (evt.params.items ?? []).map((item) => ({
              brand: item.item_brand,
              category: item.item_category,
              // @ts-ignore
              id: item.item_id,
              // @ts-ignore
              variant: item.item_variant_name,
              // @ts-ignore
              name: item.item_name,
              dimension1: '',
              dimension2: '',
              dimension3: '',
              dimension4: '',
              price: item.price,
            })),
          },
        },
      }

    case 'select_item':
      return {
        event: 'productClick',
        ecommerce: {
          click: {
            actionField: { list: evt.params.item_list_name },
            products: (evt.params.items ?? []).map((item) => ({
              brand: item.item_brand,
              category: item.item_category,
              // @ts-ignore
              id: item.item_id,
              // @ts-ignore
              variant: item.item_variant_name,
              // @ts-ignore
              name: item.item_name,
              dimension1: '',
              dimension2: '',
              dimension3: '',
              dimension4: '',
              price: item.price,
              position: item.index,
            })),
          },
        },
      }

    case 'add_to_cart':
      return {
        event: 'AddToCart',
        currencyCode: evt.params.currency,
        ecommerce: {
          add: {
            products: (evt.params.items ?? []).map((item) => ({
              brand: item.item_brand,
              category: item.item_category,
              // @ts-ignore
              id: item.item_id,
              // @ts-ignore
              variant: item.item_variant_name,
              // @ts-ignore
              name: item.item_name,
              price: item.price,
              quantity: item.quantity,
              dimension1: '',
              dimension2: '',
              dimension3: '',
            })),
          },
        },
      }

    case 'page_view':
      return {
        event: 'pageView',
        location: evt.params.location,
        page: evt.params.page,
        referrer: evt.params.referrer,
      }

    default: {
      return null
    }
  }
}

export const AnalyticsHandler = () => {
  useAnalyticsEvent((event: AnalyticsEvent) => {
    const universalAnalyticsData = parseToUniversalAnalyticsData(event)

    if (universalAnalyticsData) {
      // Cleans the ecommerce object before pushing a new one
      // This prevents the new data from getting merged with the previous one
      // which could lead do inaccurate and old data being sent with events
      //
      // source: https://developers.google.com/tag-manager/ecommerce-ga4?hl=pt-br#clearing_the_ecommerce_object
      window.dataLayer.push({ ecommerce: null })
      window.dataLayer.push(universalAnalyticsData)
    }
    // window.dataLayer.push({ event: event.name, ecommerce: event.params })

    import(`./platform/${storeConfig.platform}`).then(
      ({ default: sendEvent }) => {
        sendEvent(event)
      }
    )
  })

  return null
}

export default AnalyticsHandler

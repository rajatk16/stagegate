export interface FooterNavigationSection {
  title: string;

  links: {
    label: string;
    to: string;
  }[];
}

export const footerNavigation: FooterNavigationSection[] = [
  {
    title: 'Product',

    links: [
      {
        label: 'Features',
        to: '#features',
      },
      {
        label: 'Pricing',
        to: '#pricing',
      },
      {
        label: 'FAQ',
        to: '#faq',
      },
    ],
  },

  {
    title: 'Company',

    links: [
      {
        label: 'About',
        to: '/about',
      },
      {
        label: 'Contact',
        to: '/contact',
      },
    ],
  },

  {
    title: 'Legal',

    links: [
      {
        label: 'Privacy',
        to: '/privacy',
      },
      {
        label: 'Terms',
        to: '/terms',
      },
    ],
  },
];

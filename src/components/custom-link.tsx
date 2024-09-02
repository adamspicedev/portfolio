import Link, { LinkProps } from "next/link";

interface CustomLinkProps extends LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const CustomLink = (props: CustomLinkProps): JSX.Element => {
  const href = props.href;

  if (href.startsWith("/")) {
    return <Link {...props}>{props.children}</Link>;
  }

  if (href.startsWith("#")) {
    return <a {...props} />;
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />;
};

export default CustomLink;

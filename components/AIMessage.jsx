import React from "react";
import { ScrollView, StyleSheet, Linking, Alert } from "react-native";
import Markdown, { MarkdownIt } from "react-native-markdown-display";
import { COLORS } from "../constants/colors";
import PropTypes from "prop-types";

const AIMessage = ({ reply }) => {
  // Markdown renderer instance
  const markdownIt = MarkdownIt({});

  // Handle clickable links
  const handleLinkPress = (url) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("Invalid link", url);
        }
      })
      .catch(() => Alert.alert("Error opening link"));
  };

  return (
    <ScrollView style={styles.container}>
      <Markdown
        markdownit={markdownIt}
        onLinkPress={(url) => handleLinkPress(url)}
        style={markdownStyles}
      >
        {reply}
      </Markdown>
    </ScrollView>
  );
};

AIMessage.propTypes = {
  reply: PropTypes.string.isRequired,
};

export default AIMessage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "transparent",
  },
});

const markdownStyles = {
  body: { 
    fontSize: 16, 
    lineHeight: 26, 
    color: COLORS.text,
    margin: 0,
    padding: 0,
  },
  strong: { 
    fontWeight: "bold", 
    color: COLORS.text,
    fontSize: 18,
  },
  heading1: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginVertical: 8,
    lineHeight: 28,
  },
  heading2: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginVertical: 6,
    lineHeight: 26,
  },
  heading3: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginVertical: 4,
    lineHeight: 24,
  },
  bullet_list: { 
    marginVertical: 6,
    paddingLeft: 0,
  },
  list_item: { 
    marginVertical: 2,
    paddingLeft: 0,
  },
  link: { 
    color: COLORS.primary, 
    textDecorationLine: "underline" 
  },
  paragraph: {
    marginVertical: 4,
    padding: 0,
  },
  code_inline: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontFamily: 'monospace',
    fontSize: 16,
  },
  code_block: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
    fontFamily: 'monospace',
    fontSize: 16,
  },
  blockquote: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    paddingLeft: 12,
    marginVertical: 8,
    fontStyle: 'italic',
  },
};
